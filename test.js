const Car = require('.//models/car');

const TestFunction = async() => {
    const data = await Car.getCarFilter(null,null,null,100,0);
    // const data = await Car.getAllBrand();
    // const data = await Car.getAllType();
    // const data = await Car.getAll();
    console.log(data);
}
