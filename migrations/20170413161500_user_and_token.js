
exports.up = function(knex, Promise) {

    return Promise.all([

        knex.schema.createTable('access_token', function(table){
            table.increments('_id').primary();
            table.text('user_id').notNullable();
            table.text('token').notNullable();
            table.timestamps(true,true);
            table.index(['token'], 'idxAccessToken');
        }),

        knex.schema.alterTable('users', function(t) {

            t.text('user_id').unique();
            t.dropColumn('password');

        }).then(function() {

            return knex.raw("UPDATE users SET user_id = cpf;");

        }).then(function() {

            return knex.schema.alterTable('users', function (t) {
                console.log("alterTable users ");
                t.text('user_id').notNullable().alter();
                t.index(['user_id'], 'idxUserId');
            });
        }),

        knex.schema.alterTable('rides', function(t) {
            t.dropColumn("collected_at");
            t.dropColumn("stored_at");
        })
    ])


};

exports.down = function(knex, Promise) {

    return Promise.all([
        knex.schema.dropTable('access_token'),
        knex.schema.alterTable('users', function(t) {
            t.dropColumn('user_id');
            t.text('password');
        }),
        knex.schema.alterTable('rides', function(table){
            table.timestamp("collected_at");
            table.timestamp("stored_at").defaultTo(knex.fn.now());
        })
    ])
};

//exports.config = { transaction: false };
