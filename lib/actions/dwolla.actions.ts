'use server';

import { Client } from "dwolla-v2";

type CreateFundingSourceOptions = {
    customerId: string;
    fundingSourceName: string;
    plaidToken: string;
};

type NewDwollaCustomerParams = {
    firstName: string;
    lastName: string;
    email: string;
    type: string;
    address1: string;
    city: string;
    state: string;
    postalCode: string;
    dateOfBirth: string;
    ssn: string;
};

type TransferParams = {
    sourceFundingSourceUrl: string;
    destinationFundingSourceUrl: string;
    amount: string;
};

type AddFundingSourceParams = {
    dwollaCustomerId: string;
    processorToken: string;
    bankName: string;
};

const getEnvironment = (): "production" | "sandbox" => {
    const environment = process.env.DWOLLA_ENV as string;

    switch (environment) {
        case "sandbox":
            return "sandbox";
        case "production":
            return "production";
        default:
            throw new Error(
                "Dwolla environment should either be set to `sandbox` or `production`"
            );
    }
};

const dwollaClient = new Client({
    environment: getEnvironment(),
    key: process.env.DWOLLA_KEY as string,
    secret: process.env.DWOLLA_SECRET as string,
});

// Create a Dwolla Funding Source using a Plaid Processor Token
export const createFundingSource = async (
    options: CreateFundingSourceOptions
) => {
    try {
        const response = await dwollaClient
            .post(`customers/${options.customerId}/funding-sources`, {
                name: options.fundingSourceName,
                plaidToken: options.plaidToken,
            });
        return response.headers.get("location");
    } catch (err) {
        console.error("Creating a Funding Source Failed: ", err);
        throw err;
    }
};

export const createOnDemandAuthorization = async () => {
    try {
        const onDemandAuthorization = await dwollaClient.post(
            "on-demand-authorizations"
        );
        return onDemandAuthorization.body._links;
    } catch (err) {
        console.error("Creating an On Demand Authorization Failed: ", err);
        throw err;
    }
};

export const createDwollaCustomer = async (
    newCustomer: NewDwollaCustomerParams
) => {
    try {
        const response = await dwollaClient
            .post("customers", newCustomer);
        return response.headers.get("location");
    } catch (err) {
        console.error("Creating a Dwolla Customer Failed: ", err);
        throw err;
    }
};

export const createTransfer = async ({
    sourceFundingSourceUrl,
    destinationFundingSourceUrl,
    amount,
}: TransferParams) => {
    try {
        if (!sourceFundingSourceUrl || !destinationFundingSourceUrl || !amount) {
            throw new Error("Invalid parameters for transfer");
        }

        const requestBody = {
            _links: {
                source: {
                    href: sourceFundingSourceUrl,
                },
                destination: {
                    href: destinationFundingSourceUrl,
                },
            },
            amount: {
                currency: "USD",
                value: amount,
            },
        };

        const response = await dwollaClient.post("transfers", requestBody);

        if (!response.headers.get("location")) {
            throw new Error("Failed to get location from response");
        }

        return response.headers.get("location");
    } catch (err) {
        console.error("Transfer fund failed:", err);
        throw err; // Rethrow after logging
    }
};

export const addFundingSource = async ({
    dwollaCustomerId,
    processorToken,
    bankName,
}: AddFundingSourceParams) => {
    try {
        // create dwolla auth link
        const dwollaAuthLinks = await createOnDemandAuthorization();

        // add funding source to the dwolla customer & get the funding source url
        const fundingSourceOptions = {
            customerId: dwollaCustomerId,
            fundingSourceName: bankName,
            plaidToken: processorToken,
            _links: dwollaAuthLinks,
        };
        return await createFundingSource(fundingSourceOptions);
    } catch (err) {
        console.error("Adding Funding Source Failed: ", err);
        throw err;
    }
};
