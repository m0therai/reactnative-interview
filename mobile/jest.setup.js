// See jest.config.js: give findBy*/waitFor room for the cold-cache first render.
require('@testing-library/react-native').configure({ asyncUtilTimeout: 5_000 });
