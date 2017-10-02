use std::os::raw::c_int;

fn main() {}

#[no_mangle]
pub extern fn hello_world(n: c_int) -> c_int {
    n + 1
}
