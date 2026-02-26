#![no_std]

use soroban_sdk::{
    contract, contractimpl, contracttype, Address, Env, Symbol, Vec as SorobanVec, String as SorobanString,
};

#[contracttype]
#[derive(Clone)]
pub struct Campaign {
    pub campaign_id: u32,
    pub title: SorobanString,
    pub description: SorobanString,
    pub goal: i128,
    pub raised: i128,
    pub owner: Address,
    pub is_active: bool,
}

#[contracttype]
enum DataKey {
    Campaign(u32),
    CampaignIds,
    LastCampaignId,
}

fn read_last_id(env: &Env) -> u32 {
    env.storage()
        .instance()
        .get::<DataKey, u32>(&DataKey::LastCampaignId)
        .unwrap_or(0)
}

fn write_last_id(env: &Env, id: u32) {
    env.storage()
        .instance()
        .set(&DataKey::LastCampaignId, &id);
}

fn read_campaign_ids(env: &Env) -> SorobanVec<u32> {
    env.storage()
        .instance()
        .get::<DataKey, SorobanVec<u32>>(&DataKey::CampaignIds)
        .unwrap_or(SorobanVec::new(env))
}

fn write_campaign_ids(env: &Env, ids: &SorobanVec<u32>) {
    env.storage()
        .instance()
        .set(&DataKey::CampaignIds, ids);
}

fn read_campaign(env: &Env, id: u32) -> Option<Campaign> {
    env.storage()
        .instance()
        .get::<DataKey, Campaign>(&DataKey::Campaign(id))
}

fn write_campaign(env: &Env, campaign: &Campaign) {
    env.storage()
        .instance()
        .set(&DataKey::Campaign(campaign.campaign_id), campaign);
}

fn assert_positive_amount(amount: i128) {
    if amount <= 0 {
        panic!("amount must be > 0");
    }
}

fn emit_campaign_created(env: &Env, owner: &Address, campaign_id: u32, goal: i128) {
    let topics = (
        Symbol::new(env, "CampaignCreated"),
        owner.clone(),
        campaign_id,
    );
    env.events().publish(topics, goal);
}

fn emit_donation_made(env: &Env, donor: &Address, campaign_id: u32, amount: i128, new_raised: i128) {
    let topics = (
        Symbol::new(env, "DonationMade"),
        donor.clone(),
        campaign_id,
    );
    env.events().publish(topics, (amount, new_raised));
}

fn emit_campaign_closed(env: &Env, campaign_id: u32) {
    let topics = (Symbol::new(env, "CampaignClosed"), campaign_id);
    env.events().publish(topics, true);
}

#[contract]
pub struct FundFlowCrowdfund;

#[contractimpl]
impl FundFlowCrowdfund {
    pub fn create_campaign(
        env: Env,
        title: SorobanString,
        description: SorobanString,
        goal: i128,
    ) -> u32 {
        assert_positive_amount(goal);

        let owner = env.invoker();
        owner.require_auth();

        let mut last_id = read_last_id(&env);
        last_id += 1;

        let campaign = Campaign {
            campaign_id: last_id,
            title,
            description,
            goal,
            raised: 0,
            owner: owner.clone(),
            is_active: true,
        };

        write_campaign(&env, &campaign);

        let mut ids = read_campaign_ids(&env);
        ids.push_back(last_id);
        write_campaign_ids(&env, &ids);
        write_last_id(&env, last_id);

        emit_campaign_created(&env, &owner, last_id, campaign.goal);

        last_id
    }

    pub fn donate(env: Env, campaign_id: u32, amount: i128) -> i128 {
        assert_positive_amount(amount);

        let donor = env.invoker();
        donor.require_auth();

        let mut campaign = read_campaign(&env, campaign_id).unwrap_or_else(|| panic!("campaign not found"));

        if !campaign.is_active {
            panic!("campaign is closed");
        }

        let new_raised = campaign
            .raised
            .checked_add(amount)
            .unwrap_or_else(|| panic!("overflow on raised"));

        campaign.raised = new_raised;
        write_campaign(&env, &campaign);

        emit_donation_made(&env, &donor, campaign_id, amount, new_raised);

        new_raised
    }

    pub fn get_campaign(env: Env, campaign_id: u32) -> Campaign {
        read_campaign(&env, campaign_id).unwrap_or_else(|| panic!("campaign not found"))
    }

    pub fn list_campaigns(env: Env) -> SorobanVec<u32> {
        read_campaign_ids(&env)
    }

    pub fn close_campaign(env: Env, campaign_id: u32) {
        let invoker = env.invoker();
        invoker.require_auth();

        let mut campaign = read_campaign(&env, campaign_id).unwrap_or_else(|| panic!("campaign not found"));

        if campaign.owner != invoker {
            panic!("only owner can close campaign");
        }

        if !campaign.is_active {
            return;
        }

        campaign.is_active = false;
        write_campaign(&env, &campaign);

        emit_campaign_closed(&env, campaign_id);
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use soroban_sdk::{testutils::Address as _, Env};

    #[test]
    fn test_create_and_get_campaign() {
        let env = Env::default();
        env.mock_all_auths();

        let contract_id = env.register_contract(None, FundFlowCrowdfund);
        let client = FundFlowCrowdfundClient::new(&env, &contract_id);

        let title = SorobanString::from_str(&env, "Test");
        let desc = SorobanString::from_str(&env, "Desc");

        let id = client.create_campaign(&title, &desc, &100i128);
        assert_eq!(id, 1);

        let c = client.get_campaign(&id);
        assert_eq!(c.campaign_id, 1);
        assert_eq!(c.goal, 100);
        assert!(c.is_active);
    }
}

