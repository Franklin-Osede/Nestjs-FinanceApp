import { Module } from '@nestjs/common';
import { Mangopay } from './mangopay';
import { HttpModule } from '@nestjs/axios';

@Module({
    imports:[HttpModule],
    exports: [Mangopay],  // Make this module available for other modules to import and use it.
    providers:[Mangopay]
})
export class MangopayModule {

}
