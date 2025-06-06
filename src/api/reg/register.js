import request from '@/utils/request'

const api_name = '/reg/register'


/*
获取后台挂号分页列表(带搜索)
*/
export function getPageList(page, limit, searchObj) {
  return request({
    url: `${api_name}/${page}/${limit}`,
    method: 'get',
    params: searchObj
  })
}

/*
根据ID获取某个挂号
*/
export function getById(id) {
  return request({
    url: `${api_name}/get/${id}`,
    method: 'get'
  })
}

/*
保存一个新的挂号
*/
export function add(register) {
  return request({
    url: `${api_name}/add`,
    method: 'post',
    data: register
  })
}

/*
更新一个挂号
*/
export function update(register) {
  return request({
    url: `${api_name}/update`,
    method: 'put',
    data: register
  })
}


/*
删除某个挂号
*/
export function removeById(id) {
  return request({
    url: `${api_name}/remove/${id}`,
    method: 'delete'
  })
}

/*
批量删除多个挂号
ids的结构: ids是包含n个id的数组
*/
export function removeregisters(ids) {
  return request({
    url: `${api_name}/batchRemove`,
    method: 'delete',
    data: ids
  })
}
