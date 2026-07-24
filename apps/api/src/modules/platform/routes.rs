use worker::{Env, Response, Result};

use crate::modules::platform::repository::PlatformInventoryRepository;
use crate::shared::api_response;
use crate::shared::database::platform_database::PlatformDatabase;
use crate::shared::request_context::RequestContext;

pub async fn inventory(context: &RequestContext, env: &Env) -> Result<Response> {
    let response = match load_inventory(env).await {
        Ok(data) => api_response::success(context, data),
        Err(error) => api_response::error(context, error),
    };

    response
}

async fn load_inventory(
    env: &Env,
) -> Result<crate::modules::platform::entities::PlatformInventory, crate::shared::api_error::ApiError>
{
    let database = PlatformDatabase::from_env(env)?;
    let repository = PlatformInventoryRepository::new(database);

    repository.inventory().await
}
