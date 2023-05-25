import React, { useEffect, useState } from 'react';
import CustomButton from 'components/CustomButton';
import classnames from 'classnames';
import styles from './Schema.module.scss';
import SchemaContent from 'components/Schema1/SchemaContent';
import { GraphQLSchema } from 'graphql';
import { sdlRequest } from 'utils/schemaQuery.ts';
import { buildClientSchema } from 'graphql/index';

const Schema = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [schema, setSchema] = useState<GraphQLSchema | null>(null);
  const [error, setError] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    sdlRequest()
      .then(({ data }) => {
        const schema = buildClientSchema(data);
        setSchema(schema);
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
        setError(true);
      });
  }, []);

  return (
    <>
      <div
        className={classnames(styles.schema, {
          [styles.schema__active]: isOpen,
        })}
      >
        <CustomButton
          disabled={!schema}
          className={classnames(styles.schema_btn, {
            [styles.schema_btn__active]: isOpen,
          })}
          onClick={() => setIsOpen(!isOpen)}
        >
          <span
            className={classnames(styles.stateCircle, {
              [styles.stateCircle_error]: error,
              [styles.stateCircle_loading]: isLoading,
              [styles.stateCircle_sucsess]: !!schema,
            })}
          ></span>
          Schema
        </CustomButton>
        {schema && <SchemaContent schema={schema} />}
      </div>
    </>
  );
};

export default Schema;
