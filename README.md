# Setup

### To setup this on prod, theres a few steps.

> 1.  Firstly, you want to ensure that in the index.ts file, the "environment" constant is equal to "prod".
> 2.  Secondly, make sure the .env.prod file is cofigurated correctly.
> 3.  Run npm i to install all the packages needed
> 4.  To actually create the javascript files; you need to have typescript on the machine & run tsc. This will generate every js file in the "dist" folder, due to our config.
> 5.  After the dist folder is filled, just run `node .` and it should run.

**Note: ensure that redis & mongodb is running locally on the machine. I'll password protect these paths later.**
