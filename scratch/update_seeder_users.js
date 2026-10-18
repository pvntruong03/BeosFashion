const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../backend/src/main/java/com/beofashion/dataseed/DataInitializer.java');
let content = fs.readFileSync(file, 'utf8');

const replacement = `        // 2. USERS & EMPLOYEES
        User adminUser = userRepository.save(User.builder()
                .email("admin@beofashion.vn")
                .password(passwordEncoder.encode("123456"))
                .fullName("BEO Admin Master")
                .phone("0909111222")
                .address("209 Đường 30 Tháng 4, Phường Xuân Khánh, Ninh Kiều")
                .city("Cần Thơ")
                .role(Role.ROLE_ADMIN)
                .avatar("https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80")
                .build());

        User staffUser = userRepository.save(User.builder()
                .email("staff@beofashion.vn")
                .password(passwordEncoder.encode("123456"))
                .fullName("BEO Store Staff")
                .phone("0567740000")
                .address("209 Đường 30 Tháng 4, Phường Xuân Khánh, Ninh Kiều")
                .city("Cần Thơ")
                .role(Role.ROLE_STAFF_MANAGER)
                .avatar("https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80")
                .build());

        User managerUser = userRepository.save(User.builder()
                .email("manager.cantho@beofashion.vn")
                .password(passwordEncoder.encode("123456"))
                .fullName("BEO Store Manager")
                .phone("0567740000")
                .address("209 Đường 30 Tháng 4, Phường Xuân Khánh, Ninh Kiều")
                .city("Cần Thơ")
                .role(Role.ROLE_STAFF_MANAGER)
                .avatar("https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80")
                .build());

        employeeRepository.save(Employee.builder()
                .user(managerUser)
                .employeeCode("EMP-BEO-001")
                .store(storeBeo)
                .position("Store Manager")
                .hiredDate(LocalDate.of(2023, 1, 15))
                .build());

        employeeRepository.save(Employee.builder()
                .user(staffUser)
                .employeeCode("EMP-BEO-002")
                .store(storeBeo)
                .position("Sales Staff")
                .hiredDate(LocalDate.of(2023, 3, 1))
                .build());

        User customerUser = userRepository.save(User.builder()
                .email("customer@beofashion.vn")
                .password(passwordEncoder.encode("123456"))
                .fullName("Phạm Minh Hoàng")
                .phone("0912345678")
                .address("123 Nguyễn Huệ, Phường Bến Nghé, Quận 1")
                .city("TP. Hồ Chí Minh")
                .role(Role.ROLE_CUSTOMER)
                .avatar("https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80")
                .build());

        userRepository.save(User.builder()
                .email("customer@gmail.com")
                .password(passwordEncoder.encode("123456"))
                .fullName("Khách Hàng Thân Thiết")
                .phone("0912345679")
                .address("Cần Thơ")
                .city("Cần Thơ")
                .role(Role.ROLE_CUSTOMER)
                .avatar("https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80")
                .build());

        userRepository.save(User.builder()
                .email("junmap03@gmail.com")
                .password(passwordEncoder.encode("123456"))
                .fullName("Jun Mập")
                .phone("0918888999")
                .address("209 Đường 30 Tháng 4, Cần Thơ")
                .city("Cần Thơ")
                .role(Role.ROLE_CUSTOMER)
                .avatar("https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80")
                .build());`;

let startIdx = content.indexOf('        // 2. USERS & EMPLOYEES');
let endIdx = content.indexOf('        // 3. CATEGORIES');

if (startIdx !== -1 && endIdx !== -1) {
    content = content.slice(0, startIdx) + replacement + '\n\n' + content.slice(endIdx);
    fs.writeFileSync(file, content, 'utf8');
    console.log('SUCCESS: Updated DataInitializer.java');
} else {
    console.error('ERROR: Could not locate markers in file');
}
