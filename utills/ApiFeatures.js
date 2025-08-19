class ApiFeatures {
  constructor(query, querySt) {
    this.query = query;
    this.querySt = querySt;
  }

  filter() {
    const queryObj = { ...this.querySt };

    const excludedFields = ['sort', 'limit', 'page', 'field'];
    excludedFields.forEach((el) => delete queryObj[el]);

    // Convert operators
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    const mongoQuery = JSON.parse(queryStr);

    this.query = this.query.find(mongoQuery);
    return this;
  }

  sort() {
    if (this.querySt.sort) {
      const sortBy = this.querySt.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt'); // default sort
    }
    return this;
  }

  field() {
    if (this.querySt.field) {
      const fieldBy = this.querySt.field.split(',').join(' ');
      this.query = this.query.select(fieldBy);
    }
    return this;
  }

  paginate() {
    const page = parseInt(this.querySt.page) || 1;
    const limit = parseInt(this.querySt.limit) || 10;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    return this;
  } 
}

module.exports = ApiFeatures;
