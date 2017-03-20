
exports.up = function(knex, Promise) {

    return Promise.all([

        // "CREATE  TABLE IF NOT EXISTS users (email text UNIQUE NOT NULL, " +
        // "cpf text UNIQUE NOT NULL, _id serial, data jsonb);",
        //
        // "CREATE  INDEX IF NOT EXISTS idxUserEmail ON users (email);",
        // "CREATE  INDEX IF NOT EXISTS idxUserCPF ON users (cpf);",
        // "CREATE  INDEX IF NOT EXISTS idxUserReset ON users ((data->>'resetPasswordToken'));",

        knex.schema.createTable('users', function(table){
            table.increments('_id').primary();
            table.text('email').unique().notNullable();
            table.text('cpf').unique().notNullable();
            table.text('password');
            table.jsonb('data');
            table.timestamps(true,true);

            table.index(['email'], 'idxUserEmail');
            table.index(['cpf'], 'idxUserCPF');
            //table.index(["data->>'resetPasswordToken'"], 'idxUserReset');
        }),


        // "CREATE  TABLE IF NOT EXISTS rides (id text NOT NULL, ride_status text NOT NULL , " +
        // " mobile_id text,provider text, _id serial, data jsonb,stored_at timestamp, collected_at timestamp, end_at timestamp, begin_at timestamp," +
        // "distance_meters float, num_positions int, beginposition_location point, endposition_location point);",

        // "CREATE  INDEX IF NOT EXISTS idxRideId ON  rides (id);",
        // "CREATE  INDEX IF NOT EXISTS idxRideRideStatus ON  rides (ride_status);",
        // "CREATE  INDEX IF NOT EXISTS idxRidesStatus ON rides  ((data->>'ride_status'));",
        // "CREATE  INDEX IF NOT EXISTS idxridesEndAt ON rides  ((data->>'endAt'));",
        // "CREATE  INDEX IF NOT EXISTS idxridesID ON rides  ((data->>'id'));",
        knex.schema.createTable('rides', function(table){
            table.increments('_id').primary();
            table.string("id").notNullable();
            table.text("ride_status").notNullable();
            table.text("mobile_id");
            table.text("provider");

            table.timestamp("collected_at");

            table.timestamp("stored_at").defaultTo(knex.fn.now());
            table.timestamp("begin_at").defaultTo(knex.fn.now());
            table.timestamp("end_at").defaultTo(knex.fn.now());

            table.double("distance_meters");
            table.integer("num_positions");

            table.specificType('beginposition_location', 'point');
            table.specificType('endposition_location', 'point');

            table.timestamps(true,true);

            table.jsonb('data');

            table.index(['id'], 'idxRideId');
            table.index(['ride_status'], 'idxRideRideStatus');
            // table.index(["(data->>'ride_status')"], 'idxridesEndAt');
            // table.index(["(data->>'endAt')"], 'idxridesEndAt');
            // table.index(["(data->>'id')"], 'idxridesID');

        }),


        //
        // "CREATE  TABLE IF NOT EXISTS positions (ride_id text  NOT NULL, mobile_id text NOT NULL,  data jsonb, stored_at timestamp," +
        // " collected_at timestamp, position_location point);",
        //
        // "CREATE  INDEX IF NOT EXISTS idxRideRideId ON positions (ride_id);",
        knex.schema.createTable('positions', function(table) {
            table.increments('_id').primary();
            table.string("ride_id").notNullable();
            table.text("mobile_id").notNullable();
            table.text("provider");

            table.timestamp("stored_at");
            table.timestamp("collected_at");
            table.specificType('position_location', 'point');

            table.jsonb('data');

            table.index(['ride_id'], 'idxRideRideId');
        }),


        // "CREATE  TABLE IF NOT EXISTS latest (mobile_id text,  data jsonb, ride_id text, provider text," +
        // " position_location point, stored_at timestamp, collected_at timestamp);",
        // "CREATE  INDEX IF NOT EXISTS idxLatestMobileId ON latest (mobile_id);",
        //
        knex.schema.createTable('latest', function(table) {
            table.increments('_id').primary();
            table.string("ride_id").notNullable();
            table.text("mobile_id").notNullable();
            table.text("provider");

            table.timestamp("stored_at");
            table.timestamp("collected_at");
            table.specificType('position_location', 'point');

            table.jsonb('data');

            table.index(['mobile_id'], 'idxLatestMobileId');

        }),

        // "CREATE  TABLE IF NOT EXISTS rideprovider (data jsonb);",
        knex.schema.createTable('ride_provider', function(table) {
            table.increments('_id').primary();
            table.text("name").notNullable();
            table.jsonb('data');
            table.timestamps(true,true);
        }),


        // "CREATE TABLE IF NOT EXISTS  CONSOLIDATE_USER_DAY (
        // cpf text not null,
        // day text,
        // date timestamp ,
        // num_rides int ,
        // total_km float,
        // data jsonb);",
        // "CREATE  INDEX IF NOT EXISTS idxConsoledateCPF ON  CONSOLIDATE_USER_DAY  (cpf);",
        // "CREATE  INDEX IF NOT EXISTS dayConsolidateCollected ON  CONSOLIDATE_USER_DAY (day);",
        // "CREATE  INDEX IF NOT EXISTS dateConsolidateCollected ON  CONSOLIDATE_USER_DAY (date);",

        knex.schema.createTable('consolidate_user_day', function(table) {
            table.increments('_id').primary();
            table.text('cpf').notNullable();
            table.text('day').notNullable();
            table.timestamp("date");
            table.double("total_km");
            table.integer("num_rides");
            table.jsonb('data');
            table.timestamps(true,true);

            table.index(['cpf'], 'idxConsoledateCPF');
            table.index(['day'], 'idxDayConsolidate');
            table.index(['date'], 'idxDateConsolidate');

        })

        // Nao achei referencia ao uso desta tabela
        // knex.schema.createTable('watch_latest', function(table) {
        //     table.increments('_id').primary();
        //     table.string('day').notNullable();
        //     table.index(['day'], 'idxDate');
        // }),
        // "CREATE TABLE IF NOT EXISTS watch_latest (day text);",
        // "CREATE  INDEX IF NOT EXISTS idxDate ON  watch_latest  (day);"
    ])


};

exports.down = function(knex, Promise) {

    return Promise.all([
        knex.schema.dropTable('users'),
        knex.schema.dropTable('positions'),
        knex.schema.dropTable('rides'),
        knex.schema.dropTable('consolidate_user_day'),
        knex.schema.dropTable('latest'),
        knex.schema.dropTable('ride_provider'),
    ])
};

//exports.config = { transaction: false };
