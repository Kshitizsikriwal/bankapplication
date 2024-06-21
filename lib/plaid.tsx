import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid';

const configuration = new Configuration({
    basePath: PlaidEnvironments.sandbox,
    baseOptions: {
        header: {
            'PLAID-CLEINT-ID': process.env.PLAID_CLIENT_ID,
            'PLAID-SECRET': process.env.PLAID_SECRET,
        }
    }
})

export const plaidClient = new PlaidApi(configuration);