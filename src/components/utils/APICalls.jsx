export async function getProductData(id) {
    return fetch(
        process.env.REACT_APP_API_URL + `transactions/${id}`
    ).then(data => data.json()).catch((err) => {
        err.json()
        console.log(err)
    })
}