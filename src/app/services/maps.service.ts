import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class MapsService {
  authToken: any = null;
  constructor(
    private http: HttpClient,
    private auth: AuthService
  ) { }

  /**
   * Will fetch location based on the given LatLng, using google reverse geocode.
   *
   * @param {string} URL Reverse Geocode API
   * @param {any} options API Options
   * @returns Server response
   */
  getDetailsFromLatLng(URL: string, options: { params: { lat: any; long: any; token?: any }, headers: any }) {

    options.headers['Authorization'] = 'eyJraWQiOiI5cmVGODJFcUhydUEyTm5IT2JUYnZ0MTlLWHNtWmFQMGxwNSt4QjVXU3lzPSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiJkYzBhYzMwYi0wODBjLTRiZmEtODMxZS05OTQzZGVjYjJlMjkiLCJjb2duaXRvOmdyb3VwcyI6WyJVc2VyIiwiQWNjb3VudEFkbWluIl0sImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAudXMtZWFzdC0xLmFtYXpvbmF3cy5jb21cL3VzLWVhc3QtMV9CUXFvang2d3AiLCJwaG9uZV9udW1iZXJfdmVyaWZpZWQiOmZhbHNlLCJjb2duaXRvOnVzZXJuYW1lIjoiZGMwYWMzMGItMDgwYy00YmZhLTgzMWUtOTk0M2RlY2IyZTI5Iiwib3JpZ2luX2p0aSI6ImFlM2EwNzIyLWE3NWYtNDAxYi04YzljLTZhYmI1OTAzMzA2MSIsImN1c3RvbTp1c2VyVHlwZSI6IkluZGl2aWR1YWwiLCJhdWQiOiI3YnVjZGN1OXJwOXJiNTFvOHUybmlrNHM2MCIsImV2ZW50X2lkIjoiNGNjN2Y2N2UtMDhhMS00ODQ2LWIxMWItZWFlZWQxNWZhNzAzIiwidG9rZW5fdXNlIjoiaWQiLCJhdXRoX3RpbWUiOjE2NjUzOTk5OTUsIm5hbWUiOiJNdWRpdCBHdWxndWxpYSIsInBob25lX251bWJlciI6IisxODg5MDA3MDM1MiIsImV4cCI6MTY2NTY1NzQ1MCwiaWF0IjoxNjY1NjUzODUwLCJqdGkiOiI0NTFkOGYyZC1iMDhmLTRkYjAtYjU4NS01OGNjMzU1MmI5ZDciLCJlbWFpbCI6Im11ZGl0Lmd1bGd1bGlhQHN1bmFyY3RlY2hub2xvZ2llcy5jb20ifQ.dpoLch-i0WZ4x9ED2P5zCQSQHsY8XAA6bCRoBOH7gf3mPutn-g2bw57Khvx7gSkzvP00x91OV0YkjGZDprFsRhH3UllRSmggYqKYSBkdNsuvu0cLituY0n3h50TvpB_C8vKFvtURWpmkyYdeUEKSzbLpdJsRo9_CVnZqXrnWgiRvjmPRTDKCRTEwThl5vQZwAxVV3DdFJswaZLF0I6NG92wtwqFHo-wKnrmGkeGB-Ip1Db8SwLxThy38aS3YdL3i_NogHNej5ehtPDX0mDQbKmRexSuZzVvu7OWebGG7Z_zK0GRpQlBkzO04NXTgu32An9wiqGqf4uRIYorAdpeUXw'

    return this.http.get(URL, options)
      .pipe(
        map((item: any) => {
          if (item && item.data && item.data.status == 'OK') {
            return item.data.results
          }
        }),
        catchError((error) => {
          return throwError(() => error);
        })
      )
  }
}
