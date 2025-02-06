import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { InvestProjectDto } from './dto/invest-project.dto';
import { claimDividendDto } from './dto/claim-project.dto';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  create(@Body() createProjectDto: CreateProjectDto) {
    return this.projectsService.create(createProjectDto);
  }

  @Post('/invest')
  investProjects(@Body() investDTO:InvestProjectDto){
    return this.projectsService.investProjects(investDTO);
  }

  @Get()
  findAll() {
    return this.projectsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.projectsService.getProjectBalance(id);
  }

  @Patch(':uid')
  update(@Param('uid') uid: string, @Body() updateProjectDto: UpdateProjectDto) {
    return this.projectsService.update(uid, updateProjectDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.projectsService.remove(+id);
  }

  @Post('/dividends/create')
  @HttpCode(201)
  createDividends(@Body('address') address: string, @Body('totalMangopay') totalMangoPay:number, @Body('amount') amount: number, @Body('totalTransfer') totalTransfer: number ,@Body('retention') retention:boolean){
    return this.projectsService.createDividends(address,totalMangoPay,totalTransfer,amount,retention);
  }
  @Post('/dividends/claim')
  @HttpCode(201)
  claimDividends(@Body() dividentData: claimDividendDto ){
    return this.projectsService.claimDividend(dividentData);
  }
}
