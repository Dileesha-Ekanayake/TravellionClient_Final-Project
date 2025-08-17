import {HttpClient} from "@angular/common/http";
import {Injectable} from "@angular/core";
import {Observable} from "rxjs";

/**
 * Service responsible for handling authentication-related operations.
 * Provides methods for user login and OAuth2 redirection.
 */
@Injectable({
  providedIn: 'root'
})

export class AuthenticateService {

  constructor(private http: HttpClient) {
  }

  /**
   * Authenticates a user by sending their credentials to the login endpoint.
   *
   * @param {string} username - The username of the user attempting to log in.
   * @param {string} password - The password associated with the username.
   * @return {Observable<any>} An observable of the server's response to the login request.
   */
  authenticate(username: string, password: string) : Observable<any>{
    return this.http.post<[]>('http://localhost:8080/login',
      {username, password},
      {observe: 'response'});
  }

  /**
   * Handles the redirection for OAuth2 authentication.
   * Initiates a GET request to the OAuth2 provider's redirect URL and observes the HTTP response.
   *
   * @return {Promise<any>} A promise that resolves with the HTTP response of the OAuth2 redirection request.
   */
  async oAuth2Redirect(): Promise<any> {
    return this.http.get('http://localhost:8080/login/oauth2/code/google', { observe: 'response' }).toPromise();
  }

}
