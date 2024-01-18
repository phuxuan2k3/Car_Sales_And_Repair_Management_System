const AutoPart = require('./models/ap');

const TestFunction = async () => {
    // const data = await AutoPart.getAll();
    // const data = await AutoPart.getApPage(undefined,2,1);
    // const data = await AutoPart.getAllSupplier();
    // const data = await AutoPart.getAutoPartByID(15);
    // const entity = {
    //     name: "trung",
    //     supplier: "kien giang",
    //     quantity: 120,
    //     price: 1200
    // }
    // const id = await AutoPart.insert(entity);
    // console.log(id);
    const data = await AutoPart.delete(156);
    // const entity = {
    //     name: "newTrung",
    //     supplier: "An Giang",
    //     quantity: 120,
    //     price: 1200
    // }
    // const id = await AutoPart.update(156,entity);
    // console.log(id);
    console.log(data);
}

TestFunction();
