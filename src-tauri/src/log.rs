use std::{fs::{File, OpenOptions}, io::Write};
use chrono::Local;
use log::{Record, Level, Metadata};
pub use log::{trace, debug, info, warn, error};



struct Logger {
    file: File
}

impl log::Log for Logger {
    fn enabled(&self, metadata: &Metadata) -> bool {
        metadata.level() <= Level::Trace
    }

    fn log(&self, record: &Record) {
        if self.enabled(record.metadata()) {
            let now = Local::now().format("%F %T%.9f");
            let message = format!("[{}][{now}]: {}", record.level(), record.args());

            println!("{message}");
            writeln!(&self.file, "{message}").expect("Failed to write to log file.");
        }
    }

    fn flush(&self) {
        (&self.file).flush().expect("Failed to flush logger.");
    }
}


pub fn init() {
    let file = OpenOptions::new()
        .create(true)
        .write(true)
        .read(true)
        .append(true)
        .open("zero.log")
        .expect("Failed to open log file.");

    log::set_boxed_logger(Box::new(Logger{ file }))
        .map(|()| log::set_max_level(log::LevelFilter::Trace))
        .expect("Failed to init logger.")
}
