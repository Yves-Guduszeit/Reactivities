using System.Collections.Generic;
using System.Threading.Tasks;
using Application.Followers;
using Application.Profiles;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [Route("api/profiles")]
    public class FollowersController : BaseController
    {
        [HttpPost("{username}/follow")]
        public async Task<ActionResult<Unit>> Follow(string userName)
        {
            return await Mediator.Send(new Add.Command { UserName = userName });
        }
        
        [HttpDelete("{username}/follow")]
        public async Task<ActionResult<Unit>> Unfollow(string userName)
        {
            return await Mediator.Send(new Delete.Command { UserName = userName });
        }
        
        [HttpGet("{username}/follow")]
        public async Task<ActionResult<List<Profile>>> GetFollowings(string userName, string predicate)
        {
            return await Mediator.Send(new List.Query { UserName = userName, Predicate = predicate });
        }
    }
}
