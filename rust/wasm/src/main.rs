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

#[no_mangle]
pub extern fn get_flg(_len: i32, ptr: *const f32, x1: f32, y1: f32, cell_size: f32, c: f32, ts: f32, te: f32, clim: f32, _r_len: i32, r_ptr: *mut f32) -> f32 {
    let len = _len as usize;
    let slice: &[f32] = unsafe { std::slice::from_raw_parts(ptr, len) };
// pub extern fn get_flg(slice: &[f32], x1: f32, y1: f32, cell_size: f32, c: f32, ts: f32, te: f32, clim: f32) -> f32 {
    let x2 = x1 + cell_size;
    let y2 = y1 + cell_size;

    let vertexes = [
        (x1, y1), (x2, y1),
        (x1, y2), (x2, y2),
    ];

    let vc: Vec<_> = vertexes.iter().map(|v| {
        let &(x, y) = v;
        let mut sum: f32 = 0.0;

        for (i, _) in slice.iter().enumerate() {
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
    }).collect();

    // TODO: なぜか01を逆にするとjsと出力が同じになるっぽい？？？
    let flgs = [0x1000, 0x0100, 0x0010, 0x0001];
    let mut flg = 0x0000;
    for (i, &n) in vc.iter().enumerate() {
        if n >= clim {
            flg |= flgs[i];
        }
    }
    let flg: String = format!("{:04x}", flg);
    let mut lines = vec![0.0, 0.0, 0.0, 0.0];

    if flg == "1111" || flg == "0000" {
        return 0.0
    }

    let c1 = vc[0];
    let c2 = vc[1];
    let c3 = vc[2];
    let c4 = vc[3];

    // horizontal
    if flg == "1100" || flg == "0011" {
        let y3 = y2 * ((c1 - clim).abs() / (c1 - c3).abs()) + y1 * ((c3 - clim).abs() / (c1 - c3).abs());
        let y4 = y2 * ((c2 - clim).abs() / (c2 - c4).abs()) + y1 * ((c4 - clim).abs() / (c2 - c4).abs());

        lines = vec![x1, y3, x2, y4];
    }
    // vertical
    if flg == "1010" || flg == "0101" {
        let x3 = x2 * ((c1 - clim).abs() / (c1 - c2).abs()) + x1 * ((c2 - clim).abs() / (c1 - c2).abs());
        let x4 = x2 * ((c3 - clim).abs() / (c3 - c4).abs()) + x1 * ((c4 - clim).abs() / (c3 - c4).abs());

        lines = vec![x3, y1, x4, y2];
    }
    // left top
    if flg == "1000" || flg == "0111" || flg == "1001" {
        let x3 = x2 * ((c1 - clim).abs() / (c1 - c2).abs()) + x1 * ((c2 - clim).abs() / (c1 - c2).abs());
        let y3 = y2 * ((c1 - clim).abs() / (c1 - c3).abs()) + y1 * ((c3 - clim).abs() / (c1 - c3).abs());

        lines = vec![x3, y1, x1, y3];
    }
    // right top
    if flg == "0100" || flg == "1011" || flg == "0110" {
        let x3 = x1 * ((c2 - clim).abs() / (c2 - c1).abs()) + x2 * ((c1 - clim).abs() / (c2 - c1).abs());
        let y3 = y2 * ((c2 - clim).abs() / (c2 - c4).abs()) + y1 * ((c4 - clim).abs() / (c2 - c4).abs());

        lines = vec![x3, y1, x2, y3];
    }
    // left bottom
    if flg == "1101" || flg == "0010" || flg == "0110" {
        let x3 = x2 * ((c3 - clim).abs() / (c3 - c4).abs()) + x1 * ((c4 - clim).abs() / (c3 - c4).abs());
        let y3 = y1 * ((c3 - clim).abs() / (c3 - c1).abs()) + y2 * ((c1 - clim).abs() / (c3 - c1).abs());

        lines = vec![x3, y2, x1, y3];
    }
    // right bottom
    if flg == "0001" || flg == "1110" || flg == "1001" {
        let x3 = x1 * ((c4 - clim).abs() / (c4 - c3).abs()) + x2 * ((c3 - clim).abs() / (c4 - c3).abs());
        let y3 = y1 * ((c4 - clim).abs() / (c4 - c2).abs()) + y2 * ((c2 - clim).abs() / (c4 - c2).abs());

        lines = vec![x3, y2, x2, y3];
    }

    let r_len = _r_len as usize;
    let v: Vec<f32> = lines;
    let mut res: &mut [f32] = unsafe { std::slice::from_raw_parts_mut(r_ptr, r_len) };
    res.clone_from_slice(&v.as_slice());
    1.0
}


// const [
//     c1, c2,
//     c3, c4,
// ] = vc;

// ctx.strokeStyle = "#fff";

// holizontal
// if (flg === "1100" || flg === "0011") {
//     const y3 = y2 * (math.abs(c1 - clim) / math.abs(c1 - c3)) + y1 * (math.abs(c3 - clim) / math.abs(c1 - c3));
//     const y4 = y2 * (math.abs(c2 - clim) / math.abs(c2 - c4)) + y1 * (math.abs(c4 - clim) / math.abs(c2 - c4));
    
//     ctx.beginpath();
//     ctx.moveto(x1, y3);
//     ctx.lineto(x2, y4);
//     ctx.stroke();
//     ctx.closepath();
// }


fn main() {
    // let a = get_flg(&[9.0, 8.0, 7.0, 6.0], 0.0, 0.0, 8.0, 10_f32, 5_f32, 40_f32, 3_f32);

    // println!("{:?}", a);
}
