fn main() {}

#[no_mangle]
pub extern fn hello_world(n: u32) -> u32 {
    n + 9
}

#[no_mangle]
pub extern fn get_distance(x1: f64, y1: f64, x2: f64, y2: f64) -> f64 {
    ((x2 - x1).powi(2) + (y2 - y1).powi(2)).sqrt()
}
