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
            let message = format!("[{level}][{now}][{file}:{line}]: {args}",
                level = record.level(),
                now = Local::now().format("%F %T%.9f"),
                file = record.file().unwrap_or("INVALID"),
                line = record.line().unwrap_or(0),
                args = record.args()
            );

            let console_message = match record.level() {
                Level::Error => format!("\x1b[91m{message}\x1b[0m"),
                Level::Warn => format!("\x1b[93m{message}\x1b[0m"),
                Level::Info => format!("\x1b[92m{message}\x1b[0m"),
                Level::Debug => format!("\x1b[95m{message}\x1b[0m"),
                Level::Trace => format!("\x1b[94m{message}\x1b[0m"),
            };

            println!("{console_message}");
            writeln!(&self.file, "{message}")
                .unwrap_or_else(|err| panic!("Failed to write log file: {err}."));
        }
    }

    fn flush(&self) {
        (&self.file).flush()
            .unwrap_or_else(|err| panic!("Failed to flush log file: {err}."));
    }
}


pub fn init() -> Result<(), Box<dyn std::error::Error>> {
    let file = OpenOptions::new()
        .create(true)
        .write(true)
        .read(true)
        .append(true)
        .open("zero.log")?;

    Ok(log::set_boxed_logger(Box::new(Logger{ file }))
        .map(|()| log::set_max_level(log::LevelFilter::Trace))?)
}
