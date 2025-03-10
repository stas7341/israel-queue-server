import {boot} from "./bootstrapper";

const main = async() => boot();

main().then(res => console.log('started'));

