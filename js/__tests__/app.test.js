import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import projectMock from '../__mocks__/project.json';
import buildsMock from '../__mocks__/builds.json';
import commitMock from '../__mocks__/commit.json';
import pipelineMock from '../__mocks__/pipeline.json';

jest.useFakeTimers();
Date.now = jest.fn(() => 1538362800000);

async function createVm() {
  return require('../app').default;
}

function setupAxiosMock() {
  const mock = new MockAdapter(axios);
  mock.onGet('/projects/namespace%2Fproject1').reply(200, projectMock);
  mock.onGet('/projects/namespace%2Fproject2').reply(200, projectMock);
  mock.onGet('/projects/6944716/pipelines/?ref=master').reply(200, buildsMock);
  mock.onGet('/projects/6944716/pipelines/?ref=branch1').reply(200, buildsMock);
  mock.onGet('/projects/6944716/pipelines/23827851').reply(200, pipelineMock);
  mock.onGet('/projects/6944716/repository/commits/25fdf4ca24b7a97e9a895abc43fc54128f218ddd').reply(200, commitMock);
}

describe('Testing app.js', () => {
  let app;

  beforeAll(async () => {
    setupAxiosMock();
    document.body.innerHTML = '<div id="app"></div>';
    app = await createVm();
  });

  test('snapshotting', () => {
    expect(app).toMatchSnapshot();
  });

  test('app.methods.loadConfig', () => {
    const {
      gitlab,
      token,
      repositories,
      sortFields
    } = app;
    expect(gitlab).toEqual('gitlab.test.com');
    expect(token).toEqual('12345');

    // Validate SortFields
    expect(sortFields.length).toEqual(1);
    expect(sortFields[0]).toEqual({ field: 'project', dir: 'asc' });

    // Validate Repositories
    expect(repositories.length).toEqual(2);
    expect(repositories[0]).toEqual({
      key: "namespace/project1/branch1",
      projectName: "project1",
      branch: 'branch1',
      nameWithNamespace: "namespace/project1",
    });
    expect(repositories[1]).toEqual({
      key: "namespace/project2/master",
      projectName: "project2",
      branch: 'master',
      nameWithNamespace: "namespace/project2",
    });
  });

  test('app.methods.fetchProjects', () => {
    expect(app.projects['namespace/project1/branch1'].data).toEqual(projectMock);
    expect(app.projects['namespace/project2/master'].data).toEqual(projectMock);
  });

  test('app.methods.updateBuilds', async () => {
    const now = app.lastRun;
    jest.spyOn(app, 'updateBuilds');
    jest.spyOn(Date, 'now').mockImplementationOnce(() => 1540436400000);
    expect(app.updateBuilds).toHaveBeenCalledTimes(0);
    jest.advanceTimersByTime(70000);
    expect(app.updateBuilds).toHaveBeenCalledTimes(1);
    const then = app.lastRun;
    expect(now).not.toEqual(then);
  });
});