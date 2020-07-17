using System.Linq;
using AutoMapper;
using Domain;

namespace Application.Activities
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            CreateMap<Activity, ActivityDto>();
            CreateMap<UserActivity, AttendeeDto>()
                .ForMember(a => a.UserName, opt => opt.MapFrom(ua => ua.AppUser.UserName))
                .ForMember(a => a.DisplayName, opt => opt.MapFrom(ua => ua.AppUser.DisplayName))
                .ForMember(a => a.Image, opt => opt.MapFrom(ua => ua.AppUser.Photos.FirstOrDefault(x =>
                    x.IsMain).Url))
                .ForMember(d => d.Following, opt => opt.MapFrom<FollowingResolver>());
        }
    }
}
