#[derive(Debug, serde::Serialize)]
pub struct ZeroError(pub String);

impl std::error::Error for ZeroError {}

impl std::fmt::Display for ZeroError {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        write!(f, "{}", self.0)
    }
}
