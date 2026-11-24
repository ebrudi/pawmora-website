-- Royal Rewards: staged schema, not yet deployed.
-- No public issuance or redemption until authenticated Unity integration is tested.
CREATE TABLE IF NOT EXISTS reward_members (
 member_id TEXT PRIMARY KEY,
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS reward_milestones (
 member_id TEXT NOT NULL REFERENCES reward_members(member_id),
 milestone TEXT NOT NULL CHECK(milestone IN ('diary','town','club','founding')),
 verified_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 PRIMARY KEY(member_id,milestone)
);
CREATE TABLE IF NOT EXISTS reward_grants (
 grant_id TEXT PRIMARY KEY,
 member_id TEXT NOT NULL REFERENCES reward_members(member_id),
 reward TEXT NOT NULL CHECK(reward IN ('blossom','founding','royal')),
 code_hash TEXT NOT NULL UNIQUE,
 status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','issued','redeemed','revoked')),
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 redeemed_at TEXT,
 UNIQUE(member_id,reward)
);
CREATE INDEX IF NOT EXISTS reward_grants_status ON reward_grants(status,reward);
