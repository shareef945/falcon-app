// this function takes a bank account number and bank code and verifies ownership of the account by calling paystack for the details of the account and comparing the resulting name to the customers name
export async function verifyBankAccount(number, code, name) {
    // api call to paystack
    async function getAccount() {
        return fetch(`https://api.paystack.co/bank/resolve?account_number=${number}&bank_code=${code}`, {
            method: 'GET',
            port: 443,
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${process.env.REACT_APP_PAYSTACK_TEST_SECRET}`,
            },
        })
            .then(data => data.json()).catch((err) => {
                err.json()
                console.log(err)
            })
    }
    const str2 = name.split(" ");
    const response = await getAccount();
    if (response?.data?.account_name != undefined) {
        // uncomment to verify against name
        // const str1 = response.data.account_name.split(" ");
        // const verified = str2.every(word => str1.includes(word));
        
        // this just verifies that it's a real account
        const verified = response.data.account_number === String(number);
        if (verified == true) {
            return true;
        } else {
            return false;
        }
    } else{
        return false;
    }
}

export async function getBanks() {
    async function getCodes() {
        return fetch('https://api.paystack.co/bank?country=ghana', {
            method: 'GET',
            port: 443,
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${process.env.REACT_APP_PAYSTACK_TEST_SECRET}`,
            },
        })
            .then(data => data.json()).catch((err) => {
                err.json()
                console.log(err)
            })
    }
    const banks = await getCodes();
    return banks;
}
