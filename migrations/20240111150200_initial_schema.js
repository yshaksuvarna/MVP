/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
    // Users Table
    await knex.schema.createTableIfNotExists('users', function (table) {
        table.increments('id').primary();
        table.string('userName').notNullable();
        table.string('email').notNullable().unique();
        table.string('password').notNullable();
        table.string('mobile');
        table.string('userRole').defaultTo('USER');
        table.string('otp');
        table.string('otpExpiry'); // Storing as string based on usage context, check if Date required. Assuming string for now based on service usage implicitly.
        table.boolean('isVerified').defaultTo(0);
        table.boolean('inActive').defaultTo(0);
        table.text('remarks');
        table.timestamp('createdAt').defaultTo(knex.fn.now());
    });

    // Banners Table
    await knex.schema.createTableIfNotExists('banners', function (table) {
        table.increments('id').primary();
        table.string('title').notNullable();
        table.string('subTitle');
        table.string('image');
        table.boolean('inActive').defaultTo(0);
        table.timestamp('createdAt').defaultTo(knex.fn.now());
    });

    // Toppers Table
    await knex.schema.createTableIfNotExists('toppers', function (table) {
        table.increments('id').primary();
        table.string('name').notNullable();
        table.string('achievement');
        table.string('image');
        table.boolean('inActive').defaultTo(0);
        table.timestamp('createdAt').defaultTo(knex.fn.now());
    });

    // Courses Table
    await knex.schema.createTableIfNotExists('courses', function (table) {
        table.increments('id').primary();
        table.string('title').notNullable();
        table.text('description'); // text for longer descriptions
        table.string('duration');
        table.string('image');
        table.boolean('inActive').defaultTo(0);
        table.timestamp('createdAt').defaultTo(knex.fn.now());
    });

    // Contact Info Table
    await knex.schema.createTableIfNotExists('contact_info', function (table) {
        table.increments('id').primary();
        table.string('phone');
        table.string('email');
        table.string('address');
        table.string('googleMapLink');
        table.timestamp('createdAt').defaultTo(knex.fn.now());
    });

    // Current Affairs Table
    await knex.schema.createTableIfNotExists('current_affairs', function (table) {
        table.increments('id').primary();
        table.string('title').notNullable();
        table.text('summary');
        table.string('category');
        table.string('source');
        table.string('affairDate'); // Should optimally be date, but keeping string to be safe if client sends formatted string
        table.text('tags'); // Storing as CSV string usually
        table.string('importance').defaultTo('Normal');
        table.boolean('isPublished').defaultTo(1);
        table.boolean('isDeleted').defaultTo(0);
        table.timestamp('createdAt').defaultTo(knex.fn.now());
    });

    // FAQs Table
    await knex.schema.createTableIfNotExists('faqs', function (table) {
        table.increments('id').primary();
        table.string('question').notNullable();
        table.text('answer').notNullable();
        table.boolean('inActive').defaultTo(0);
        table.timestamp('createdAt').defaultTo(knex.fn.now());
    });

    // Locations Table
    await knex.schema.createTableIfNotExists('locations', function (table) {
        table.increments('id').primary();
        table.string('cityName').notNullable();
        table.string('instituteName').notNullable();
        table.string('address').notNullable();
        table.string('landmark');
        table.string('googleMapLink');
        table.string('image');
        table.boolean('inActive').defaultTo(0);
        table.timestamp('createdAt').defaultTo(knex.fn.now());
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
    await knex.schema.dropTableIfExists('locations');
    await knex.schema.dropTableIfExists('faqs');
    await knex.schema.dropTableIfExists('current_affairs');
    await knex.schema.dropTableIfExists('contact_info');
    await knex.schema.dropTableIfExists('courses');
    await knex.schema.dropTableIfExists('toppers');
    await knex.schema.dropTableIfExists('banners');
    await knex.schema.dropTableIfExists('users');
};
