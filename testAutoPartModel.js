const AutoPart = require('./models/ap');

const TestFunction = async () => {
    const data = await AutoPart.getAll();
    console.log(data);
}

TestFunction();
