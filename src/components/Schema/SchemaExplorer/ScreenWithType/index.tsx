import styles from '../SchemaExplorer.module.scss';
import { Link } from 'react-router-dom';
import React from 'react';
import { GraphQLArgument, GraphQLType } from 'graphql';
import { screenHistoryType } from 'types';

interface IScreenWithType {
  value: GraphQLType;
  onClickType: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  onClickField: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  onClickBack: () => void;
  currentScreen: Array<screenHistoryType>;
}

function ScreenWithType(props: IScreenWithType) {
  const { value, currentScreen, onClickType, onClickField, onClickBack } = props;
  const fields = 'getFields' in value ? Object.values(value.getFields()) : [];
  return (
    <div className={styles.main_container}>
      {currentScreen.length > 2 && (
        <div className={styles.backMenu} onClick={onClickBack}>
          {'<' + currentScreen[currentScreen.length - 2]?.name}
        </div>
      )}
      <div className={styles.name}>{'name' in value && value?.name}</div>
      {fields.map((field, index) => (
        <div key={index}>
          <div>
            <Link className={styles.fieldName} to="" onClick={(e) => onClickField(e)}>
              {field.name}
            </Link>
            {'args' in field && !!field.args.length && (
              <>
                (
                <span>
                  {field.args.map((arg: GraphQLArgument, argIndex: number) => (
                    <div key={argIndex} className={styles.arg}>
                      <span>
                        <span className={styles.argName}>{arg.name}</span>
                        :&nbsp;
                        <Link className={styles.typeName} to="" onClick={(e) => onClickType(e)}>
                          {arg.type.toString()}
                        </Link>
                      </span>
                    </div>
                  ))}
                </span>
                )
              </>
            )}
            :&nbsp;
            <Link className={styles.typeName} to="" onClick={(e) => onClickType(e)}>
              {field.type.toString()}
            </Link>
          </div>
          <div className={styles.desc}>
            <p>{field.description}</p>
          </div>
        </div>
      ))}
      {'description' in value && value.description && (
        <div>{value.description.replaceAll('`', '')}</div>
      )}
    </div>
  );
}

export default ScreenWithType;
