import {Pipe, PipeTransform} from '@angular/core';
import { Images } from '../../../../both/collections/images.collection';
import { Store } from '../../../../both/models/store.model';
 
@Pipe({
  name: 'displayMainImage'
})
export class DisplayMainImagePipe implements PipeTransform {
  transform(store: Store) {
    if (!store) {
      return;
    }
    let imageUrl: string;
    let imageId: string = (store.images || [])[0];
 

    const found = Images.findOne(imageId);
 
    if (found) {
      imageUrl = found.url;
    }else{
        imageUrl="images/side_bar.jpg";
    }
 
    return imageUrl;
  }
}
