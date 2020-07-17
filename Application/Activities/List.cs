using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Application.Interfaces;
using AutoMapper;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Activities
{
    public class List
    {
        public class ActivitiesEnvelope
        {
            public List<ActivityDto> Activities { get; set; }

            public int ActivityCount { get; set; }
        }

        public class Query : IRequest<ActivitiesEnvelope>
        {
            private readonly DateTime? _startDate;
            public Query(int? limit, int? offset, bool isGoing, bool isHost, DateTime? startDate)
            {
                this._startDate = startDate;
                Limit = limit;
                Offset = offset;
                IsGoing = isGoing;
                IsHost = isHost;
                StartDate = startDate ?? DateTime.Now;
            }

            public int? Limit { get; set; }

            public int? Offset { get; set; }

            public bool IsGoing { get; set; }

            public bool IsHost { get; set; }

            public DateTime? StartDate { get; set; }
        }

        public class Handler : IRequestHandler<Query, ActivitiesEnvelope>
        {
            private readonly DataContext _context;
            private readonly IUserAccessor _userAccessor;
            private readonly IMapper _mapper;

            public Handler(DataContext context, IUserAccessor userAccessor, IMapper mapper)
            {
                _context = context;
                _userAccessor = userAccessor;
                _mapper = mapper;
            }

            public async Task<ActivitiesEnvelope> Handle(Query request, CancellationToken cancellationToken)
            {
                var queryable = _context.Activities
                    .Where(x => x.Date >= request.StartDate)
                    .OrderBy(x => x.Date)
                    .AsQueryable();

                if (request.IsGoing && !request.IsHost)
                {
                    queryable = queryable.Where(x => x.UserActivities.Any(a =>
                        a.AppUser.UserName == _userAccessor.GetCurrentUserName()));
                }

                if (!request.IsGoing && request.IsHost)
                {
                    queryable = queryable.Where(x => x.UserActivities.Any(a =>
                        a.AppUser.UserName == _userAccessor.GetCurrentUserName() && a.IsHost));
                }

                var activities = await queryable
                    .Skip(request.Offset ?? 0)
                    .Take(request.Limit ?? 3)
                    .ToListAsync();

                return new ActivitiesEnvelope
                {
                    Activities = _mapper.Map<List<Activity>, List<ActivityDto>>(activities),
                    ActivityCount = queryable.Count()
                };
            }
        }
    }
}