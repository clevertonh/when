const { getEntry } = require('when-aws/dynamodb/actions/get-entry');

const { transformUser } = require('../../../transformers/user');

module.exports.currentUser = async (root, { id, token }) => {
  const params = {
    TableName: process.env.USER_TABLE,
    Key: {
      id,
    }
  }

  const user = await transformUser((await getEntry(params)).Item);
  return user.token === token ? user : null;
}
