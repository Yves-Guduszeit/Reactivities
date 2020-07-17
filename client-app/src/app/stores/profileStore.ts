import { RootStore } from './rootStore';
import { observable, action, runInAction, computed, reaction } from 'mobx';
import { IProfile, IPhoto, IUserActivity } from '../models/profile';
import agent from '../api/agent';
import { toast } from 'react-toastify';

export default class ProfileStore {
  rootStore: RootStore;

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;

    reaction(
      () => this.activeTab,
      activeTab => {
        if (activeTab === 3 || activeTab === 4) {
          const predicate = activeTab === 3 ? 'followers' : 'followings';
          this.loadFollowings(predicate);
        } else {
          this.followings = [];
        }
      }
    );
  }

  @observable profile: IProfile | null = null;
  @observable loadingProfile = true;
  @observable uploadingPhoto = false;
  @observable loading = false;
  @observable followings: IProfile[] = [];
  @observable activeTab: number = 0;
  @observable userActivities: IUserActivity[] = [];
  @observable loadingActivities = false;

  @computed get isCurrentUser() {
    if (this.rootStore.userStore.user && this.profile) {
      return this.rootStore.userStore.user.userName === this.profile.userName;
    } else {
      return false;
    }
  }

  @action loadProfile = async (userName: string) => {
    this.loadingProfile = true;
    try {
      const profile = await agent.Profiles.get(userName);
      runInAction('loading profile', () => {
        this.profile = profile;
      });
    } catch (error) {
      console.log(error);
    } finally {
      runInAction('load profile finally', () => {
        this.loadingProfile = false;
      });
    }
  };

  @action uploadPhoto = async (file: Blob) => {
    this.uploadingPhoto = true;
    try {
      const photo = await agent.Profiles.uploadPhoto(file);
      runInAction('uploading photo', () => {
        if (this.profile) {
          this.profile.photos.push(photo);
          if (photo.isMain && this.rootStore.userStore.user) {
            this.rootStore.userStore.user.image = photo.url;
            this.profile.image = photo.url;
          }
        }
      });
    } catch (error) {
      console.log(error);
      toast.error('Problem uploading photo');
    } finally {
      runInAction('upload photo finally', () => {
        this.uploadingPhoto = false;
      });
    }
  };

  @action setMainPhoto = async (photo: IPhoto) => {
    this.loading = true;
    try {
      await agent.Profiles.setMainPhoto(photo.id);
      runInAction('setting photo as main', () => {
        this.rootStore.userStore.user!.image = photo.url;
        this.profile!.photos.find((a) => a.isMain)!.isMain = false;
        this.profile!.photos.find((a) => a.id === photo.id!)!.isMain = true;
        this.profile!.image = photo.url;
      });
    } catch (error) {
      console.log(error);
      toast.error('Problem setting photo as main');
    } finally {
      runInAction('set photo as main finally', () => {
        this.loading = false;
      });
    }
  };

  @action deletePhoto = async (photo: IPhoto) => {
    this.loading = true;
    try {
      await agent.Profiles.deletePhoto(photo.id);
      runInAction('deleting photo', () => {
        this.profile!.photos = this.profile!.photos.filter(
          (a) => a.id !== photo.id!
        );
      });
    } catch (error) {
      console.log(error);
      toast.error('Problem deleting photo');
    } finally {
      runInAction('delete photo finally', () => {
        this.loading = false;
      });
    }
  };

  @action updateProfile = async (profile: Partial<IProfile>) => {
    try {
      await agent.Profiles.updateProfile(profile);
      runInAction('updating photo', () => {
        if (
          profile.displayName !== this.rootStore.userStore.user!.displayName
        ) {
          this.rootStore.userStore.user!.displayName = profile.displayName!;
        }
        this.profile = { ...this.profile!, ...profile };
      });
    } catch (error) {
      console.log(error);
      toast.error('Problem updating profile');
    }
  };

  @action follow = async (userName: string) => {
    this.loading = true;
    try {
      await agent.Profiles.follow(userName);
      runInAction('following user', () => {
        this.profile!.following = true;
        this.profile!.followersCount++;
      });
    } catch (error) {
      console.log(error);
      toast.error('Problem following user');
    } finally {
      runInAction('follow user finally', () => {
        this.loading = false;
      });
    }
  };

  @action unfollow = async (userName: string) => {
    this.loading = true;
    try {
      await agent.Profiles.unfollow(userName);
      runInAction('unfollowing user', () => {
        this.profile!.following = false;
        this.profile!.followersCount--;
      });
    } catch (error) {
      console.log(error);
      toast.error('Problem unfollowing user');
    } finally {
      runInAction('unfollow user finally', () => {
        this.loading = false;
      });
    }
  };

  @action loadFollowings = async (predicate: string) => {
    this.loading = true;
    try {
      const profiles = await agent.Profiles.listFollowings(this.profile!.userName, predicate);
      runInAction('loading followings', () => {
        this.followings = profiles;
      });
    } catch (error) {
      console.log(error);
      toast.error('Problem loading followings');
    } finally {
      runInAction('load followings finally', () => {
        this.loading = false;
      });
    }
  };

  @action setActiveTab = (activeIndex: number) => {
    this.activeTab = activeIndex;
  }

  @action loadUserActivities = async (userName: string, predicate?: string) => {
    this.loadingActivities = true;
    try {
      const activities = await agent.Profiles.listActivities(this.profile!.userName, predicate!);
      runInAction('loading user activities', () => {
        this.userActivities = activities;
      });
    } catch (error) {
      console.log(error);
      toast.error('Problem loading user activities');
    } finally {
      runInAction('load user activities finally', () => {
        this.loadingActivities = false;
      });
    }
  }
}
