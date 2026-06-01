#!/usr/bin/env bash
set -euo pipefail

# Test-mode Stripe helper for the SummonIQ Leads product line.
# Prefer Bizfoo's normal SEED_SYNC_STRIPE=true flow when DATABASE_URL and
# STRIPE_SECRET_KEY are configured. This script is here for manual setup notes
# and should not be run against live mode without explicit confirmation.

if ! command -v stripe >/dev/null 2>&1; then
  echo "Stripe CLI is not installed. Run: brew install stripe/stripe-cli/stripe"
  exit 1
fi

if ! stripe config --list >/dev/null 2>&1; then
  echo "Stripe CLI is not authenticated. Run: stripe login"
  exit 1
fi

echo "Use test mode. After creating prices, add the returned price IDs through Bizfoo's existing product/price records."

create_one_time() {
  local name="$1"
  local amount="$2"
  local description="$3"
  local product_id
  product_id="$(stripe products create --name "$name" --description "$description" --metadata product_line=summoniq-leads --format json | node -e 'let d="";process.stdin.on("data",c=>d+=c);process.stdin.on("end",()=>console.log(JSON.parse(d).id))')"
  stripe prices create --product "$product_id" --currency usd --unit-amount "$amount" --metadata product_line=summoniq-leads
}

create_monthly() {
  local name="$1"
  local amount="$2"
  local description="$3"
  local product_id
  product_id="$(stripe products create --name "$name" --description "$description" --metadata product_line=summoniq-leads --format json | node -e 'let d="";process.stdin.on("data",c=>d+=c);process.stdin.on("end",()=>console.log(JSON.parse(d).id))')"
  stripe prices create --product "$product_id" --currency usd --unit-amount "$amount" --recurring interval=month --metadata product_line=summoniq-leads
}

create_one_time "SummonIQ Leads - DFW Commercial Roofing Pilot" 250000 "One vertical, one metro, sample lead report, scoring model, and CRM-ready export."
create_one_time "SummonIQ Leads - Local Lead Engine Starter Kit" 29900 "Developer starter kit for vertical-specific local lead engines."
create_one_time "SummonIQ Leads - HubSpot CRM Add-On" 150000 "HubSpot field mapping and push workflow for a SummonIQ Leads pilot."
create_one_time "SummonIQ Leads - Salesforce CRM Add-On" 250000 "Salesforce object mapping and opportunity creation for a SummonIQ Leads pilot."
create_monthly "SummonIQ Leads - Monthly Data Refresh" 100000 "Monthly source refresh, scoring QA, and CRM-ready delivery."
create_one_time "Buyer Signals to CRM Setup" 350000 "Connect SignalSplash buyer-signal analytics to CRM follow-up workflows."
