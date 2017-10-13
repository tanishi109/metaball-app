#[no_mangle]
pub extern fn hello_world(n: u32) -> u32 {
    n + 9
}

#[no_mangle]
pub extern fn get_distance(x1: f32, y1: f32, x2: f32, y2: f32) -> f32 {
    ((x2 - x1).powi(2) + (y2 - y1).powi(2)).sqrt()
}

#[no_mangle]
pub extern fn get_concentration(tm: f32, c: f32, ts: f32, te: f32) -> f32 {
    (c / ((ts - te).powi(2))) * ((tm - te).powi(2))
}

use std::mem::forget;
use std::ffi::CString;
use std::os::raw::c_char;

#[no_mangle]
pub extern fn get_flg(_len: i32, ptr: *const f32, x1: f32, y1: f32, cell_size: f32, c: f32, ts: f32, te: f32, clim: f32) -> *const c_char {
    let len = _len as usize;
    let slice: &[f32] = unsafe { std::slice::from_raw_parts(ptr, len) };

// pub extern fn get_flg(slice: &[f32], x1: f32, y1: f32, cell_size: f32, c: f32, ts: f32, te: f32, clim: f32) -> *const c_char {
    let x2 = x1 + cell_size;
    let y2 = y1 + cell_size;

    let vertexes = [
        (x1, y1), (x2, y1),
        (x1, y2), (x2, y2),
    ];

    let vc = vertexes.into_iter().map(|v| {
        let &(x, y) = v;
        let mut sum = 0.0;

        for (i, _) in slice.into_iter().enumerate() {
            if i % 2 != 0 { continue; }

            let boid_x = slice[i];
            let boid_y = slice[i+1];
            let d = get_distance(boid_x, boid_y, x, y);
            let c = get_concentration(d, c, ts, te);

            if d <= te {
                sum += c;
            }
        }

        sum
    });

    // TODO: なぜか01を逆にするとjsと出力が同じになるっぽい？？？
    let flgs = [0x1000, 0x0100, 0x0010, 0x0001];
    let mut flg = 0x0000;
    for (i, n) in vc.into_iter().enumerate() {
        if n >= clim {
            flg |= flgs[i];
        }
    }

    let flg_str: String = format!("{:04x}", flg);
    let s = CString::new(flg_str).unwrap();
    let p = s.as_ptr();
    forget(s);
    p
}
  
fn main() {
    // get_flg(&[9.0, 8.0, 7.0, 6.0], 0.0, 0.0, 8.0, 10_f32, 5_f32, 40_f32, 3_f32);
}
