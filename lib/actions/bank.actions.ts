import {
    CountryCode,
} from "plaid";

import { plaidClient } from "../plaid";
import { parseStringify } from "../utils";

import { getTransactionsByBankId } from "./transaction.actions";
import { getBanks, getBank } from "./user.actions";

// Define your custom types here
type getAccountsProps = { userId: string };
type getAccountProps = { appwriteItemId: string };
type getInstitutionProps = { institutionId: string };
type getTransactionsProps = { accessToken: string };
type Bank = { $id: string; accessToken: string; shareableId: string };
type Transaction = { $id: string; name: string; amount: number; $createdAt: string; channel: string; category: string; senderBankId: string };

// Get multiple bank accounts
export const getAccounts = async ({ userId }: getAccountsProps) => {
    try {
        const banks = await getBanks({ userId });

        const accounts = await Promise.all(
            banks?.map(async (bank: Bank) => {
                const accountsResponse = await plaidClient.accountsGet({
                    access_token: bank.accessToken,
                });
                const accountData = accountsResponse.data.accounts[0];

                const institution = await getInstitution({
                    institutionId: accountsResponse.data.item.institution_id!,
                });

                const account = {
                    id: accountData.account_id,
                    availableBalance: accountData.balances.available!,
                    currentBalance: accountData.balances.current!,
                    institutionId: institution.institution_id,
                    name: accountData.name,
                    officialName: accountData.official_name,
                    mask: accountData.mask!,
                    type: accountData.type as string,
                    subtype: accountData.subtype as string,
                    appwriteItemId: bank.$id,
                    shareableId: bank.shareableId,
                };

                return account;
            })
        );

        const totalBanks = accounts.length;
        const totalCurrentBalance = accounts.reduce((total, account) => total + account.currentBalance, 0);

        return parseStringify({ data: accounts, totalBanks, totalCurrentBalance });
    } catch (error) {
        console.error("An error occurred while getting the accounts:", error);
        throw error;
    }
};

// Get one bank account
export const getAccount = async ({ appwriteItemId }: getAccountProps) => {
    try {
        const bank = await getBank({ documentId: appwriteItemId });

        if (!bank) {
            throw new Error("Bank not found.");
        }

        const accountsResponse = await plaidClient.accountsGet({
            access_token: bank.accessToken,
        });
        const accountData = accountsResponse.data.accounts[0];

        if (!accountData) {
            throw new Error("No account data found.");
        }

        let transferTransactions = [];
        try {
            const transferTransactionsData = await getTransactionsByBankId({ bankId: bank.$id });
            transferTransactions = transferTransactionsData.map((transferData: Transaction) => ({
                id: transferData.$id,
                name: transferData.name!,
                amount: transferData.amount!,
                date: transferData.$createdAt,
                paymentChannel: transferData.channel,
                category: transferData.category,
                type: transferData.senderBankId === bank.$id ? "debit" : "credit",
            }));
        } catch (error) {
            console.error("Error fetching transfer transactions:", error);
        }

        const institution = await getInstitution({
            institutionId: accountsResponse.data.item.institution_id!,
        });

        const transactions = await getTransactions({ accessToken: bank.accessToken });

        const account = {
            id: accountData.account_id,
            availableBalance: accountData.balances.available!,
            currentBalance: accountData.balances.current!,
            institutionId: institution.institution_id,
            name: accountData.name,
            officialName: accountData.official_name,
            mask: accountData.mask!,
            type: accountData.type as string,
            subtype: accountData.subtype! as string,
            appwriteItemId: bank.$id,
        };

        const allTransactions = [...transactions, ...transferTransactions].sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        return parseStringify({ data: account, transactions: allTransactions });
    } catch (error) {
        console.error("An error occurred while getting the account:", error);
        throw error;
    }
};




// Get bank info
export const getInstitution = async ({
    institutionId,
}: getInstitutionProps) => {
    try {
        const institutionResponse = await plaidClient.institutionsGetById({
            institution_id: institutionId,
            country_codes: ["US"] as CountryCode[],
        });

        const institution = institutionResponse.data.institution;

        return parseStringify(institution);
    } catch (error) {
        console.error("An error occurred while getting the institution:", error);
        throw error;
    }
};

// Get transactions
export const getTransactions = async ({
    accessToken,
}: getTransactionsProps) => {
    let hasMore = true;
    let transactions: any = [];

    try {
        while (hasMore) {
            const response = await plaidClient.transactionsSync({
                access_token: accessToken,
            });

            const data = response.data;

            transactions = transactions.concat(data.added.map((transaction) => ({
                id: transaction.transaction_id,
                name: transaction.name,
                paymentChannel: transaction.payment_channel,
                type: transaction.payment_channel,
                accountId: transaction.account_id,
                amount: transaction.amount,
                pending: transaction.pending,
                category: transaction.category ? transaction.category[0] : "",
                date: transaction.date,
                image: transaction.logo_url,
            })));

            hasMore = data.has_more;
        }

        return parseStringify(transactions);
    } catch (error) {
        console.error("An error occurred while getting the transactions:", error);
        throw error;
    }
};
