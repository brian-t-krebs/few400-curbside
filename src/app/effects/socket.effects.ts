import { Actions, createEffect, ofType } from '@ngrx/effects';
import { AppState } from '../reducers';
import { Store } from '@ngrx/store';
import { Injectable } from '@angular/core';
import * as signalR from '@aspnet/signalr';
import { environment } from '../../environments/environment';
import * as actions from '../actions/socket.actions';
import { tap } from 'rxjs/operators';

@Injectable()
export class SocketEffects {
  // It's going to call into the web socket.

  sendOrder$ = createEffect(() =>
    this.action$.pipe(
      ofType(actions.curbsideOrderRequest),
      tap(a => this.hubConnection.send('PlaceOrder', a.payload))
    ), { dispatch: false }
  );

  private hubConnection: signalR.HubConnection;
  constructor(private action$: Actions, private store: Store<AppState>) {

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(environment.wsUrl + '/curbsidehub')
      .build();

    this.hubConnection.start()
      .then(() => console.log('Started the Hub Connection')).catch(err => console.error('Error in hub connection', err));

    this.hubConnection.on('OrderPlaced', (data) => this.store.dispatch(actions.orderPlaced({ payload: data })));
    this.hubConnection.on('OrderProcessed', (data) => this.store.dispatch(actions.orderProcessed({ payload: data })));
    this.hubConnection.on('OrderItemProcessed', (data) => this.store.dispatch(actions.orderItemProcessed({ ...data })));

  }
}



/* Handle a couple actions from the UI


-- Send Order

-- Handle WebSocket messages coming from the server
  OrderPlaces -> orderPlaced
    OrderProcessed -> orderProcessed
  OrderItemProcessed -> orderItemProcessed

  // Optionally - ApiOrderPlaced
*/

