module.exports = class Features {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }

    search() {
        const keyword = this.queryString.keyword ? {
            name: {
                $regex: this.queryString.keyword,
                $options: "i"
            }
        } : {};
        this.query = this.query.find({ ...keyword });
        return this;
    }

    filter() {
        const queryCopy = { ...this.queryString };
        const removeFields = ["keyword", "page", "limit"];
        removeFields.forEach(field => delete queryCopy[field]);

        // for price
        let queryStr = JSON.stringify({ ...queryCopy });
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, key => `$${key}`);

        this.query = this.query.find(JSON.parse(queryStr));
        return this;
    }

    pagination(resultsPerPage) {
        const page = Number(this.queryString.page) || 1;
        const skip = resultsPerPage * (page - 1);

        this.query = this.query.limit(resultsPerPage).skip(skip);
        return this

    }
}