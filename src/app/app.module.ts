import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { Ng2Bs3ModalModule } from 'ng2-bs3-modal/ng2-bs3-modal';

@NgModule({
  imports: [BrowserModule, Ng2Bs3ModalModule],
  declarations: [AppComponent],
  bootstrap: [AppComponent]
})
export class AppModule {}
