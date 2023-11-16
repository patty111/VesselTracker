const { Model } = require('objection');

class Vessel extends Model {
  static get tableName() {
    return 'Vessel';  // db table name
  }
}

module.exports = Vessel;