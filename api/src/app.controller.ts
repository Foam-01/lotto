import { Controller, Get, Param, Post, Body, Put, Delete } from '@nestjs/common';
import { AppService } from './app.service';
import { it } from 'node:test';

@Controller("api/app")
export class AppController {

  private items = [
    { id: 1, name: 'Item 1' },
    { id: 2, name: 'Item 2' },
    { id: 3, name: 'Item 3' },
  ]

  @Get()
  getItems() {
    return this.items
  }

    @Get(":id")
    getItem(@Param("id") id: string) {
      const itemId = parseInt(id);
      const item = this.items.find((i) => i.id === itemId);
      return item ? item : 'Item not found';
    }

    @Post()
    createItem(@Body() newItem: { name: string}) {
      const newId = this.items.length +1;
      const newRecord = { id: newId, name: newItem.name};

      this.items.push(newRecord);
      return newRecord;
    }
    
    @Put(':id')
    updateItem(@Param('id') id: string, @Body() updateItem: { name: string}) {
      const itemId = parseInt(id);
      const index = this.items.findIndex((i => i.id === itemId));

      if (index !== -1) {
        this.items[index].name = updateItem.name;
        return this.items[index];
      }
      return 'Item not found';
    }
 
    @Delete(':id')
    deleteItem(@Param('id') id: string) {
      const idForDelete = parseInt(id);
      const index = this.items.findIndex(i => i.id === idForDelete);

      if (index !== -1) {
        const item = this.items.splice(index, 1);
        return item;
      }
      return 'Item not found'; 
    }

}
