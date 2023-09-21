use log::{Record, Level, Metadata};
pub use log::{trace, debug, info, warn, error};

struct Logger;

impl log::Log for Logger {
    fn enabled(&self, metadata: &Metadata) -> bool {
        metadata.level() <= Level::Trace
    }

    fn log(&self, record: &Record) {
        if self.enabled(record.metadata()) {
            println!("{} - {}", record.level(), record.args());
        }
    }

    fn flush(&self) {}
}

pub fn init() -> Result<(), log::SetLoggerError> {
    log::set_boxed_logger(Box::new(Logger)).map(|()| log::set_max_level(log::LevelFilter::Trace))
}
