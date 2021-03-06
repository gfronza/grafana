import React from 'react';
import { hot } from 'react-hot-loader';
import { inject, observer } from 'mobx-react';
import PageHeader from 'app/core/components/PageHeader/PageHeader';
import { NavStore } from 'app/stores/NavStore/NavStore';
import { TeamsStore, Team } from 'app/stores/TeamsStore/TeamsStore';
import { BackendSrv } from 'app/core/services/backend_srv';
import DeleteButton from 'app/core/components/DeleteButton/DeleteButton';
import EmptyListCTA from 'app/core/components/EmptyListCTA/EmptyListCTA';

interface Props {
  nav: typeof NavStore.Type;
  teams: typeof TeamsStore.Type;
  backendSrv: BackendSrv;
}

@inject('nav', 'teams')
@observer
export class TeamList extends React.Component<Props, any> {
  constructor(props) {
    super(props);

    this.props.nav.load('cfg', 'teams');
    this.fetchTeams();
  }

  fetchTeams() {
    this.props.teams.loadTeams();
  }

  deleteTeam(team: Team) {
    this.props.backendSrv.delete('/api/teams/' + team.id).then(this.fetchTeams.bind(this));
  }

  onSearchQueryChange = evt => {
    this.props.teams.setSearchQuery(evt.target.value);
  };

  renderTeamMember(team: Team): JSX.Element {
    const teamUrl = `org/teams/edit/${team.id}`;

    return (
      <tr key={team.id}>
        <td className="width-4 text-center link-td">
          <a href={teamUrl}>
            <img className="filter-table__avatar" src={team.avatarUrl} />
          </a>
        </td>
        <td className="link-td">
          <a href={teamUrl}>{team.name}</a>
        </td>
        <td className="link-td">
          <a href={teamUrl}>{team.email}</a>
        </td>
        <td className="link-td">
          <a href={teamUrl}>{team.memberCount}</a>
        </td>
        <td className="text-right">
          <DeleteButton onConfirmDelete={() => this.deleteTeam(team)} />
        </td>
      </tr>
    );
  }

  renderTeamList(teams) {
    return (
      <div className="page-container page-body">
        <div className="page-action-bar">
          <div className="gf-form gf-form--grow">
            <label className="gf-form--has-input-icon gf-form--grow">
              <input
                type="text"
                className="gf-form-input"
                placeholder="Search teams"
                value={teams.search}
                onChange={this.onSearchQueryChange}
              />
              <i className="gf-form-input-icon fa fa-search" />
            </label>
          </div>

          <div className="page-action-bar__spacer" />

          <a className="btn btn-success" href="org/teams/new">
            <i className="fa fa-plus" /> New team
          </a>
        </div>

        <div className="admin-list-table">
          <table className="filter-table filter-table--hover form-inline">
            <thead>
              <tr>
                <th />
                <th>Name</th>
                <th>Email</th>
                <th>Members</th>
                <th style={{ width: '1%' }} />
              </tr>
            </thead>
            <tbody>{teams.filteredTeams.map(team => this.renderTeamMember(team))}</tbody>
          </table>
        </div>
      </div>
    );
  }

  renderEmptyList() {
    return (
      <div className="page-container page-body">
        <EmptyListCTA
          model={{
            title: "You haven't created any teams yet.",
            buttonIcon: 'fa fa-plus',
            buttonLink: 'org/teams/new',
            buttonTitle: ' New team',
            proTip: 'Assign folder and dashboard permissions to teams instead of users to ease administration.',
            proTipLink: '',
            proTipLinkTitle: '',
            proTipTarget: '_blank',
          }}
        />
      </div>
    );
  }

  render() {
    const { nav, teams } = this.props;
    let view;

    if (teams.filteredTeams.length > 0) {
      view = this.renderTeamList(teams);
    } else {
      view = this.renderEmptyList();
    }

    return (
      <div>
        <PageHeader model={nav as any} />
        {view}
      </div>
    );
  }
}

export default hot(module)(TeamList);
