import React, { useEffect, useCallback, useRef, useState } from 'react';
import Monaco from '@monaco-editor/react';
import * as monacoEditor from 'monaco-editor/esm/vs/editor/editor.api';
import Tabs from 'components/Tabs';
import { useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import CustomButton from 'components/CustomButton';
import Variables from 'components/Variables';
import { editorOptions } from 'constants/monacoSettings';
import { FieldName, QueryItem } from 'types/index';
import {
  getIndex,
  getStartQuery,
  handleEditorDidMount,
  makeRequest,
  parseQuery,
  updateQueryField,
} from 'utils/editor';
import styles from './EditorPage.module.scss';
import Response from 'components/Response';

const defaultQuery: QueryItem[] = [getStartQuery()];

const EditorPage: React.FC = () => {
  const [selectedQueryId, setSelectedQueryId] = useState(defaultQuery[0].id);
  const [queries, setQueries] = useState(defaultQuery);
  const [isVarsAndHeadersOpen, setIsVarsAndHeadersOpen] = useState(false);

  const activeQuery = queries[getIndex(queries, selectedQueryId)];

  const addTab = useCallback(() => {
    const newQuery = getStartQuery();
    setQueries((currQueries) => [...currQueries, newQuery]);
    setSelectedQueryId(newQuery.id);
  }, []);

  const changeTab = useCallback(
    (id: string, tabName: string) => {
      if (!isVarsAndHeadersOpen && tabName !== 'New Tab') {
        setIsVarsAndHeadersOpen(true);
      }

      if (tabName === 'New Tab') {
        setSelectedQueryId(id);
      } else if (activeQuery.selectedVarsOrHeadersTab !== tabName) {
        const newVarsOrHeadersTab =
          activeQuery.selectedVarsOrHeadersTab === 'variables' ? 'headers' : 'variables';
        setQueries((currQueries) =>
          currQueries.map((query: QueryItem) =>
            query.id === id ? { ...query, selectedVarsOrHeadersTab: newVarsOrHeadersTab } : query
          )
        );
      }
    },
    [isVarsAndHeadersOpen, activeQuery.selectedVarsOrHeadersTab]
  );

  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setLoading(false);
      if (!user) {
        navigate('/');
      }
    });

    return unsubscribe;
  }, [navigate]);

  const deleteTab = useCallback(
    (queryIdToDelete: string) => {
      const queryIndexToDelete = getIndex(queries, queryIdToDelete);
      const filteredQueries = queries.filter((query) => query.id !== queryIdToDelete);
      if (filteredQueries.length) {
        const prevQueryIndex = queryIndexToDelete === 0 ? 0 : queryIndexToDelete - 1;
        setSelectedQueryId(filteredQueries[prevQueryIndex].id);
        setQueries(filteredQueries);
      } else {
        setQueries(defaultQuery);
        setSelectedQueryId(() => defaultQuery[0].id);
      }
    },
    [queries]
  );

  const onChangeQuery = useCallback(
    (value: string | undefined, field: FieldName): void => {
      if (value !== undefined) {
        setQueries((queries) => updateQueryField(queries, field, value, selectedQueryId));
      }
    },
    [selectedQueryId]
  );

  const fetchAndSetResponse = useCallback(async () => {
    const query = activeQuery.query.value;
    const variables = activeQuery.variables.value;

    const resultQuery = variables ? parseQuery(query, JSON.parse(variables)) : query;
    if (resultQuery) {
      const responseData = await makeRequest(resultQuery);
      setQueries((queries) =>
        updateQueryField(queries, 'answer', JSON.stringify(responseData), selectedQueryId)
      );
    }
  }, [selectedQueryId, activeQuery.query.value, activeQuery.variables.value]);

  const editorRef = useRef<monacoEditor.editor.IStandaloneCodeEditor | null>(null);

  const currentTabs = [
    {
      tabId: activeQuery.id,
      label: activeQuery.variables.tabName,
      query: activeQuery.variables.value,
    },
    {
      tabId: activeQuery.id,
      label: activeQuery.headers.tabName,
      query: activeQuery.headers.value,
    },
  ];

  const editorContent =
    activeQuery.selectedVarsOrHeadersTab === 'variables'
      ? activeQuery.variables.value
      : activeQuery.headers.value;

  const answerContent = activeQuery.answer.value ? JSON.parse(activeQuery.answer.value) : '';

  const tabs = queries.map((tab) => {
    return {
      tabId: tab.id,
      label: tab.query.tabName,
      query: tab.query.value,
      isSelected: tab.id === selectedQueryId,
    };
  });

  if (loading) {
    return null;
  }

  return (
    <div className={styles.editor}>
      <Tabs
        tabs={tabs}
        selectedTabId={selectedQueryId}
        onClickTab={(id: string) => changeTab(id, 'New Tab')}
        onClickTabAdd={addTab}
        onClickTabDelete={deleteTab}
      />
      <div key={activeQuery.id} className={styles.editor_inner}>
        <div>
          <Monaco
            defaultLanguage="typescript"
            defaultValue={activeQuery.query.value}
            onMount={handleEditorDidMount(editorRef)}
            onChange={(value) => onChangeQuery(value, 'query')}
            options={editorOptions}
          />
          <Variables
            isOpen={isVarsAndHeadersOpen}
            setIsOpen={setIsVarsAndHeadersOpen}
            editorContent={editorContent}
            onChangeQuery={(value) => onChangeQuery(value, activeQuery.selectedVarsOrHeadersTab)}
          >
            <Tabs
              tabs={currentTabs}
              selectedTabId={selectedQueryId}
              onClickTab={(id: string, tabName: string) => {
                changeTab(id, tabName.toLowerCase());
              }}
              selectedVarsOrHeadersTab={activeQuery.selectedVarsOrHeadersTab}
            />
          </Variables>
        </div>
        <div className={styles.control}>
          <CustomButton onClick={fetchAndSetResponse} className={styles.control_btn}>
            <svg width="35" height="35" viewBox="3.5,4.5,24,24">
              <path d="M 11 9 L 24 16 L 11 23 z"></path>
            </svg>
          </CustomButton>
        </div>
        <Response responseData={answerContent}></Response>
      </div>
    </div>
  );
};

export default EditorPage;
