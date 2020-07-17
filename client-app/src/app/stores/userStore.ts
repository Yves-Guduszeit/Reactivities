import { observable, computed, action, runInAction } from 'mobx';
import { IUser, IUserFormValues } from '../models/user';
import { RootStore } from './rootStore';
import agent from '../api/agent';
import { history } from '../..';

export default class UserStore {
  rootStore: RootStore;

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
  }

  @observable user: IUser | null = null;
  @observable loading = false;

  @computed get isLoggedIn() {
    return !!this.user;
  }
  

  @action register = async (values: IUserFormValues) => {
    try {
      const user = await agent.User.register(values);
      this.rootStore.commonStore.setToken(user.token);
      this.rootStore.commonStore.setRefreshToken(user.refreshToken);
      this.rootStore.modalStore.closeModal();
      history.push('/activities');
    } catch (error) {
      throw error;
    }
  };

  @action login = async (values: IUserFormValues) => {
    try {
      const user = await agent.User.login(values);
      runInAction('login', () => {
        this.user = user;
      });
      this.rootStore.commonStore.setToken(user.token);
      this.rootStore.commonStore.setRefreshToken(user.refreshToken);
      this.rootStore.modalStore.closeModal();
      history.push('/activities');
    } catch (error) {
      throw error;
    }
  };

  @action getUser = async () => {
    try {
      const user = await agent.User.current();
      runInAction('getting user', () => {
        this.user = user;
      });
    } catch (error) {
      console.log(error);
    }
  };

  @action logout = () => {
    this.rootStore.commonStore.setToken(null);
    this.rootStore.commonStore.setRefreshToken(null);
    this.user = null;
    history.push('/');
  };

  @action fbLogin = async (response: any) => {
    this.loading = true;
    try {
      const user = await agent.User.fbLogin(response.accessToken);
      runInAction('fbLogin', () => {
        this.user = user;
      });
      this.rootStore.commonStore.setToken(user.token);
      this.rootStore.commonStore.setRefreshToken(user.refreshToken);
      this.rootStore.modalStore.closeModal();
      history.push('/activities');
    } catch (error) {
      throw error;
    } finally {
      runInAction('fbLogin finally', () => {
        this.loading = false;
      });
    }
  };
}
