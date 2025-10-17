DO
$$
DECLARE
   cmd text;
BEGIN
   SELECT string_agg('TRUNCATE TABLE ' || tablename || ' RESTART IDENTITY CASCADE;', ' ')
   INTO cmd
   FROM pg_tables
   WHERE schemaname = 'public';

   RAISE NOTICE 'Executing: %', cmd;
   EXECUTE cmd;
END;
$$;
