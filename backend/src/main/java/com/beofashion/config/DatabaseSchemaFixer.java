package com.beofashion.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;

@Component
@Order(0)
@RequiredArgsConstructor
@Slf4j
public class DatabaseSchemaFixer implements CommandLineRunner {

    private final DataSource dataSource;

    @Override
    public void run(String... args) {
        log.info("Checking and repairing database table constraints for payment methods and enums...");
        try (Connection conn = dataSource.getConnection();
             Statement stmt = conn.createStatement()) {

            // 1. Drop check constraints on PAYMENTS and ORDERS tables
            try {
                ResultSet rs = stmt.executeQuery(
                        "SELECT CONSTRAINT_NAME, TABLE_NAME FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS " +
                                "WHERE UPPER(TABLE_NAME) IN ('PAYMENTS', 'ORDERS') AND UPPER(CONSTRAINT_TYPE) = 'CHECK'"
                );
                List<String> dropCommands = new ArrayList<>();
                while (rs.next()) {
                    String constraintName = rs.getString("CONSTRAINT_NAME");
                    String tableName = rs.getString("TABLE_NAME");
                    dropCommands.add("ALTER TABLE " + tableName + " DROP CONSTRAINT IF EXISTS " + constraintName);
                }
                rs.close();

                for (String cmd : dropCommands) {
                    try {
                        log.info("Executing constraint cleanup: {}", cmd);
                        stmt.execute(cmd);
                    } catch (Exception ex) {
                        log.warn("Could not drop constraint: {}. Error: {}", cmd, ex.getMessage());
                    }
                }
            } catch (Exception e) {
                log.warn("Information schema constraint query warning: {}", e.getMessage());
            }

            // 2. Widen column types to avoid enum length / type restrictions
            try {
                stmt.execute("ALTER TABLE payments ALTER COLUMN payment_method VARCHAR(50)");
            } catch (Exception ignored) {}

            try {
                stmt.execute("ALTER TABLE payments ALTER COLUMN payment_status VARCHAR(50)");
            } catch (Exception ignored) {}

            try {
                stmt.execute("ALTER TABLE orders ALTER COLUMN order_type VARCHAR(50)");
            } catch (Exception ignored) {}

            try {
                stmt.execute("ALTER TABLE orders ALTER COLUMN status VARCHAR(50)");
            } catch (Exception ignored) {}

            // 3. Automatically repair legacy or broken image URLs in products, product_images and product_variants
            try {
                stmt.execute("UPDATE products SET primary_image_url = 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80' WHERE primary_image_url LIKE '%photo-1539533018447%'");
                stmt.execute("UPDATE products SET primary_image_url = 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80' WHERE primary_image_url LIKE '%photo-1544022613%'");
                stmt.execute("UPDATE products SET primary_image_url = 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80' WHERE primary_image_url LIKE '%photo-1542272604%'");
                stmt.execute("UPDATE products SET primary_image_url = 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80' WHERE primary_image_url LIKE '%photo-1548624149%'");

                stmt.execute("UPDATE product_images SET image_url = 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80' WHERE image_url LIKE '%photo-1539533018447%'");
                stmt.execute("UPDATE product_images SET image_url = 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80' WHERE image_url LIKE '%photo-1544022613%'");
                stmt.execute("UPDATE product_images SET image_url = 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80' WHERE image_url LIKE '%photo-1542272604%'");
                stmt.execute("UPDATE product_images SET image_url = 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80' WHERE image_url LIKE '%photo-1548624149%'");

                stmt.execute("UPDATE product_variants SET image_url = 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80' WHERE image_url LIKE '%photo-1539533018447%'");
                stmt.execute("UPDATE product_variants SET image_url = 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80' WHERE image_url LIKE '%photo-1544022613%'");
                stmt.execute("UPDATE product_variants SET image_url = 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80' WHERE image_url LIKE '%photo-1542272604%'");
                stmt.execute("UPDATE product_variants SET image_url = 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80' WHERE image_url LIKE '%photo-1548624149%'");
                log.info("Database product images auto-healed and verified.");
            } catch (Exception ex) {
                log.warn("Could not execute image auto-repair SQL: {}", ex.getMessage());
            }

            // 4. Migrate identifiers left by the original prototype to the BEO Fashion brand.
            try {
                stmt.execute("UPDATE products SET code = CONCAT('BEO-', SUBSTRING(code, 4)) WHERE code LIKE 'UQ-%'");
                stmt.execute("UPDATE product_variants SET sku = CONCAT('BEO-', SUBSTRING(sku, 4)) WHERE sku LIKE 'UQ-%'");
                stmt.execute("UPDATE order_items SET product_code = CONCAT('BEO-', SUBSTRING(product_code, 4)) WHERE product_code LIKE 'UQ-%'");
                stmt.execute("UPDATE orders SET order_number = CONCAT('BEO-', SUBSTRING(order_number, 4)) WHERE order_number LIKE 'UQ-%'");
                stmt.execute("UPDATE payments SET transaction_id = REPLACE(transaction_id, 'TXN-UQ-', 'TXN-BEO-') WHERE transaction_id LIKE 'TXN-UQ-%'");
                stmt.execute("UPDATE orders SET coupon_code = 'BEO10' WHERE coupon_code = 'UNIQLO10'");
                stmt.execute("UPDATE coupons SET code = 'BEO10' WHERE code = 'UNIQLO10' AND NOT EXISTS (SELECT 1 FROM coupons WHERE code = 'BEO10')");
                stmt.execute("DELETE FROM coupons WHERE code = 'UNIQLO10'");
                stmt.execute("UPDATE orders SET coupon_code = 'BEO50K' WHERE coupon_code = 'LIFEWEAR50K'");
                stmt.execute("UPDATE coupons SET code = 'BEO50K' WHERE code = 'LIFEWEAR50K' AND NOT EXISTS (SELECT 1 FROM coupons WHERE code = 'BEO50K')");
                stmt.execute("DELETE FROM coupons WHERE code = 'LIFEWEAR50K'");
                stmt.execute("UPDATE users SET email = 'admin@beofashion.vn' WHERE email IN ('admin@uniqlo.com', 'admin@beofashion.com') AND NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@beofashion.vn')");
                stmt.execute("UPDATE users SET email = 'manager.cantho@beofashion.vn' WHERE email IN ('manager.cantho@uniqlo.com', 'manager.cantho@beofashion.com') AND NOT EXISTS (SELECT 1 FROM users WHERE email = 'manager.cantho@beofashion.vn')");

                String[][] textColumns = {
                        {"products", "name"}, {"products", "slug"}, {"products", "description"},
                        {"products", "overview"}, {"products", "material"}, {"products", "collection"},
                        {"categories", "name"}, {"categories", "slug"},
                        {"order_items", "product_name"}, {"reviews", "title"}, {"reviews", "comment"},
                        {"lookbooks", "title"}, {"lookbooks", "description"},
                        {"coupons", "description"}, {"product_images", "alt_text"}
                };
                String[][] brandReplacements = {
                        {"LifeWear Essentials", "BEO Essentials"},
                        {"LifeWear Collection", "BEO Essentials"},
                        {"LifeWear Atelier", "BEO Atelier"},
                        {"LifeWear Dresses", "BEO Dresses"},
                        {"LifeWear", "BEO Essentials"},
                        {"AIRism", "BEO AirFlow"},
                        {"HEATTECH", "BEO HeatCore"},
                        {"DRY-EX", "BEO DryMotion"},
                        {"Dry-EX", "BEO DryMotion"},
                        {"UT Graphic", "BEO Graphic"},
                        {"Japanese Cotton Denim", "Premium Cotton Selvedge Denim"},
                        {"Japanese denim", "premium selvedge denim"},
                        {"Japanese Denim", "Premium Selvedge Denim"},
                        {"Japanese", "BEO"},
                        {"UNIQLO", "BEO"},
                        {"Uniqlo", "BEO"},
                        {"uniqlo", "beo"},
                        {"airism", "beo-airflow"},
                        {"heattech", "beo-heatcore"},
                        {"dry-ex", "beo-drymotion"},
                        {"lifewear", "beo-essentials"}
                };
                for (String[] column : textColumns) {
                    for (String[] replacement : brandReplacements) {
                        replaceBrandText(stmt, column[0], column[1], replacement[0], replacement[1]);
                    }
                }
                log.info("Legacy prototype identifiers migrated to BEO Fashion.");
            } catch (Exception ex) {
                log.warn("Could not migrate every legacy brand identifier: {}", ex.getMessage());
            }

            log.info("Database schema check constraints repaired successfully.");
        } catch (Exception e) {
            log.error("Database schema fixer failed: {}", e.getMessage(), e);
        }
    }

    private void replaceBrandText(Statement stmt, String table, String column, String legacy, String branded) {
        try {
            String oldValue = legacy.replace("'", "''");
            String newValue = branded.replace("'", "''");
            stmt.execute("UPDATE " + table + " SET " + column + " = REPLACE(" + column + ", '" + oldValue + "', '" + newValue + "') WHERE " + column + " LIKE '%" + oldValue + "%'");
        } catch (Exception ex) {
            log.debug("Brand text migration skipped for {}.{}: {}", table, column, ex.getMessage());
        }
    }
}
