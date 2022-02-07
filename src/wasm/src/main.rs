use std::env;

use wasm;

fn main() {
    let args: Vec<String> = env::args().collect();
    let path = &args[1];
    let resolution = &args[2];
    let outpath = &args[3];
    wasm::check(path, resolution.parse().unwrap(), outpath);
}
