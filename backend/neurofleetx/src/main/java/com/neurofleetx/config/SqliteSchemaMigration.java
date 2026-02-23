package com.neurofleetx.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * SQLite schema migration helper.
 *
 * Ensures existing SQLite database files are forward-compatible with the current JPA entity mappings.
 * This is intentionally minimal: it only adds missing columns that are required for core flows
 * (e.g., auth register/login) to prevent 500s due to schema mismatch.
 */
@Component
public class SqliteSchemaMigration implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(SqliteSchemaMigration.class);

    private final JdbcTemplate jdbcTemplate;

    public SqliteSchemaMigration(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(ApplicationArguments args) {
        migrateUsersTable();
    }

    private void migrateUsersTable() {
        try {
            // If users table doesn't exist yet, seed SQL will create it; no need to do anything here.
            if (!tableExists("users")) {
                log.info("SQLite migration: 'users' table not found; skipping column checks (seed will create it).");
                return;
            }

            Set<String> columns = getTableColumns("users");
            if (!columns.contains("avatar")) {
                log.warn("SQLite migration: adding missing column users.avatar");
                jdbcTemplate.execute("ALTER TABLE users ADD COLUMN avatar TEXT");
            } else {
                log.info("SQLite migration: users.avatar already present");
            }
        } catch (Exception e) {
            // Fail fast: schema mismatch breaks core auth flows, better to surface clearly in logs.
            log.error("SQLite migration failed; database schema may be incompatible.", e);
            throw e;
        }
    }

    private boolean tableExists(String tableName) {
        Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(1) FROM sqlite_master WHERE type='table' AND name=?",
                Integer.class,
                tableName
        );
        return count != null && count > 0;
    }

    private Set<String> getTableColumns(String tableName) {
        List<String> cols = jdbcTemplate.query(
                "PRAGMA table_info(" + tableName + ")",
                (rs, rowNum) -> rs.getString("name")
        );
        return new HashSet<>(cols);
    }
}
