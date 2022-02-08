use std::env;

use checker_wasm;

fn main() {
    let args: Vec<String> = env::args().collect();
    let path = &args[1];
    let diameter = &args[2];
    let outpath = &args[3];
    checker_wasm::check(path, diameter.parse().unwrap(), outpath);
}
